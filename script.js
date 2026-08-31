// ===================== الحالة =====================
let elements = [];
let selectedIndex = null;
let nextId = 1;
let projectName = 'غير مسماة';
let autoSaveInterval = null;

// ===================== تخزين النطاقات المخصصة =====================
let customDomains = JSON.parse(localStorage.getItem('siteforge_domains')) || {};

// ===================== تهيئة الحفظ التلقائي =====================
document.addEventListener('DOMContentLoaded', () => {
    // بدء الحفظ التلقائي كل 30 ثانية
    autoSaveInterval = setInterval(() => {
        if (elements.length > 0) {
            autoSaveProject();
        }
    }, 30000);

    // تحميل آخر مشروع محفوظ
    loadLastProject();

    // إعداد باقي الميزات
    setupDragAndDrop();
    setupAIModal();
    addDomainManager();
});

// ===================== الحفظ التلقائي =====================
function autoSaveProject() {
    const projectData = {
        name: projectName,
        elements: elements,
        nextId: nextId,
        timestamp: Date.now()
    };
    localStorage.setItem('siteforge_autosave', JSON.stringify(projectData));
    console.log('💾 تم الحفظ التلقائي في', new Date().toLocaleTimeString());
}

function loadLastProject() {
    const saved = localStorage.getItem('siteforge_autosave');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.elements && data.elements.length > 0) {
                const restore = confirm(`🔄 هل تريد استعادة المشروع المحفوظ (${data.name})؟`);
                if (restore) {
                    elements = data.elements;
                    nextId = data.nextId || elements.length + 1;
                    projectName = data.name || 'غير مسماة';
                    renderCanvas();
                    document.getElementById('propertyPanel').innerHTML = '<p>اختر عنصرًا لتعديل خصائصه</p>';
                    alert(`✅ تم استعادة المشروع: ${projectName}`);
                }
            }
        } catch (e) {
            console.log('لا يوجد مشروع محفوظ');
        }
    }
}

// ===================== حفظ المشروع =====================
function saveProject() {
    const name = prompt('📝 أدخل اسم المشروع:', projectName);
    if (name) {
        projectName = name;
        const projectData = {
            name: projectName,
            elements: elements,
            nextId: nextId,
            timestamp: Date.now()
        };
        
        // حفظ في قائمة المشاريع
        let projects = JSON.parse(localStorage.getItem('siteforge_projects')) || [];
        const existingIndex = projects.findIndex(p => p.name === projectName);
        if (existingIndex !== -1) {
            projects[existingIndex] = projectData;
        } else {
            projects.push(projectData);
        }
        localStorage.setItem('siteforge_projects', JSON.stringify(projects));
        
        // حفظ كحفظ تلقائي
        localStorage.setItem('siteforge_autosave', JSON.stringify(projectData));
        
        alert(`✅ تم حفظ المشروع "${projectName}" بنجاح!`);
    }
}

// ===================== تحميل مشروع =====================
function loadProject() {
    const projects = JSON.parse(localStorage.getItem('siteforge_projects')) || [];
    if (projects.length === 0) {
        alert('📭 لا توجد مشاريع محفوظة');
        return;
    }

    const projectNames = projects.map((p, i) => `${i + 1}. ${p.name} (${new Date(p.timestamp).toLocaleDateString()})`).join('\n');
    const choice = prompt(`📂 اختر رقم المشروع:\n\n${projectNames}`);
    
    if (choice) {
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < projects.length) {
            const data = projects[index];
            elements = data.elements;
            nextId = data.nextId || elements.length + 1;
            projectName = data.name;
            renderCanvas();
            document.getElementById('propertyPanel').innerHTML = '<p>اختر عنصرًا لتعديل خصائصه</p>';
            alert(`✅ تم تحميل المشروع: ${projectName}`);
        }
    }
}

// ===================== عرض جميع المشاريع =====================
function showAllProjects() {
    const projects = JSON.parse(localStorage.getItem('siteforge_projects')) || [];
    if (projects.length === 0) {
        alert('📭 لا توجد مشاريع محفوظة');
        return;
    }

    let message = '📋 قائمة المشاريع:\n\n';
    projects.forEach((p, i) => {
        message += `${i + 1}. ${p.name}\n   العناصر: ${p.elements.length}\n   التاريخ: ${new Date(p.timestamp).toLocaleString()}\n\n`;
    });
    message += '\nلتحميل مشروع، استخدم زر "تحميل مشروع"';
    alert(message);
}

// ===================== إضافة عنصر =====================
function addElement(type) {
    const newElement = {
        id: nextId++,
        type: type,
        content: getDefaultContent(type),
        styles: {}
    };
    elements.push(newElement);
    renderCanvas();
    selectElement(elements.length - 1);
    autoSaveProject();
}

function getDefaultContent(type) {
    const defaults = {
        text: '<h3>نص جديد</h3><p>اكتب المحتوى هنا...</p>',
        image: '<img src="https://via.placeholder.com/300x200" alt="صورة" style="max-width:100%;border-radius:8px;">',
        button: '<a href="#" style="display:inline-block;background:#238636;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;">زر</a>',
        video: '<iframe width="100%" height="200" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>',
        section: '<div style="padding:20px;background:#161b22;border-radius:8px;border:1px solid #30363d;"><h3>قسم جديد</h3><p>محتوى القسم...</p></div>',
        menu: '<ul style="list-style:none;display:flex;gap:16px;padding:0;flex-wrap:wrap;"><li><a href="#">الرئيسية</a></li><li><a href="#">خدمات</a></li><li><a href="#">اتصل</a></li></ul>',
        map: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sar!2s!4v1" width="100%" height="300" style="border:0;" allowfullscreen loading="lazy"></iframe>',
        contact: '<form style="display:flex;flex-direction:column;gap:12px;max-width:400px;"><input type="text" placeholder="الاسم" style="padding:10px;border-radius:6px;border:1px solid #30363d;background:#0d1117;color:#e6edf3;"><input type="email" placeholder="البريد الإلكتروني" style="padding:10px;border-radius:6px;border:1px solid #30363d;background:#0d1117;color:#e6edf3;"><textarea placeholder="الرسالة" rows="4" style="padding:10px;border-radius:6px;border:1px solid #30363d;background:#0d1117;color:#e6edf3;"></textarea><button type="submit" style="padding:10px;background:#238636;color:white;border:none;border-radius:6px;cursor:pointer;">إرسال</button></form>',
        social: '<div style="display:flex;gap:12px;font-size:24px;"><a href="#" style="color:#58a6ff;">📘</a><a href="#" style="color:#58a6ff;">🐦</a><a href="#" style="color:#58a6ff;">📸</a><a href="#" style="color:#58a6ff;">💼</a><a href="#" style="color:#58a6ff;">▶️</a></div>',
        counter: '<div style="text-align:center;padding:20px;background:#161b22;border-radius:8px;"><div style="font-size:36px;font-weight:bold;color:#58a6ff;">1,234</div><div style="color:#8b949e;">زائر</div></div>',
        testimonial: '<div style="padding:20px;background:#161b22;border-radius:8px;border-right:4px solid #58a6ff;"><p style="font-style:italic;color:#e6edf3;">"خدمة رائعة! أنصح بها الجميع."</p><p style="color:#8b949e;margin-top:8px;">- أحمد محمد</p></div>',
        pricing: '<div style="padding:20px;background:#161b22;border-radius:8px;text-align:center;border:1px solid #30363d;"><h3>الباقة الأساسية</h3><div style="font-size:28px;font-weight:bold;color:#58a6ff;margin:12px 0;">$19</div><div style="color:#8b949e;">/شهر</div><ul style="list-style:none;padding:0;margin:16px 0;text-align:right;"><li>✅ ميزة 1</li><li>✅ ميزة 2</li><li>❌ ميزة 3</li></ul><a href="#" style="display:inline-block;background:#238636;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;">اختر الباقة</a></div>'
    };
    return defaults[type] || '<p>عنصر جديد</p>';
}

// ===================== عرض الكانفاس =====================
function renderCanvas() {
    const canvas = document.getElementById('canvas');
    if (elements.length === 0) {
        canvas.innerHTML = `
            <div class="empty-state">
                <h2>✨ ابدأ بإنشاء موقعك</h2>
                <p>اسحب العناصر من اليمين أو اختر قالبًا</p>
            </div>
        `;
        return;
    }

    canvas.innerHTML = elements.map((el, index) => `
        <div class="element-item ${selectedIndex === index ? 'selected' : ''}" 
             onclick="selectElement(${index})" data-index="${index}">
            <button class="delete-btn" onclick="deleteElement(${index}, event)">✕</button>
            ${el.content}
        </div>
    `).join('');
}

// ===================== اختيار عنصر =====================
function selectElement(index) {
    selectedIndex = index;
    renderCanvas();
    showProperties(index);
}

function showProperties(index) {
    const panel = document.getElementById('propertyPanel');
    const el = elements[index];
    if (!el) return;

    panel.innerHTML = `
        <label>نوع العنصر</label>
        <input value="${el.type}" disabled style="background:#21262d;">

        <label>المحتوى (HTML)</label>
        <textarea rows="4" oninput="updateContent(${index}, this.value)">${el.content}</textarea>

        <label>خلفية</label>
        <input type="color" value="#161b22" onchange="updateStyle(${index}, 'background', this.value)">

        <label>لون النص</label>
        <input type="color" value="#e6edf3" onchange="updateStyle(${index}, 'color', this.value)">

        <label>هوامش (px)</label>
        <input type="number" value="0" onchange="updateStyle(${index}, 'margin', this.value + 'px')">
        
        <hr style="border-color:#30363d;margin:12px 0;">
        
        <button onclick="duplicateElement(${index})" style="background:#1f6feb;color:white;border:none;padding:8px;border-radius:6px;cursor:pointer;width:100%;">📋 نسخ العنصر</button>
    `;
}

// ===================== نسخ عنصر =====================
function duplicateElement(index) {
    const original = elements[index];
    const newElement = {
        id: nextId++,
        type: original.type,
        content: original.content,
        styles: { ...original.styles }
    };
    elements.splice(index + 1, 0, newElement);
    renderCanvas();
    selectElement(index + 1);
    autoSaveProject();
}

// ===================== تحديث المحتوى والخصائص =====================
function updateContent(index, value) {
    elements[index].content = value;
    renderCanvas();
    autoSaveProject();
}

function updateStyle(index, property, value) {
    elements[index].styles[property] = value;
    renderCanvas();
    autoSaveProject();
}

// ===================== حذف عنصر =====================
function deleteElement(index, event) {
    event.stopPropagation();
    elements.splice(index, 1);
    selectedIndex = null;
    renderCanvas();
    document.getElementById('propertyPanel').innerHTML = '<p>اختر عنصرًا لتعديل خصائصه</p>';
    autoSaveProject();
}

// ===================== تحميل قالب =====================
function loadTemplate(type) {
    const templates = {
        personal: [
            { type: 'text', content: '<h1 style="text-align:center;">👤 مرحباً، أنا أحمد</h1><p style="text-align:center;">مطور مواقع ويب</p>' },
            { type: 'social', content: '<div style="display:flex;gap:12px;font-size:24px;justify-content:center;"><a href="#" style="color:#58a6ff;">📘</a><a href="#" style="color:#58a6ff;">🐦</a><a href="#" style="color:#58a6ff;">📸</a></div>' },
            { type: 'button', content: '<a href="#" style="display:inline-block;background:#238636;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;margin:0 auto;display:table;">تواصل معي</a>' }
        ],
        store: [
            { type: 'text', content: '<h1 style="text-align:center;">🛍️ متجر الإلكترونيات</h1>' },
            { type: 'section', content: '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;"><div style="background:#161b22;padding:16px;border-radius:8px;">📱 هاتف ذكي<br><strong>$599</strong></div><div style="background:#161b22;padding:16px;border-radius:8px;">💻 لابتوب<br><strong>$899</strong></div><div style="background:#161b22;padding:16px;border-radius:8px;">🎧 سماعات<br><strong>$99</strong></div></div>' },
            { type: 'button', content: '<a href="#" style="display:inline-block;background:#238636;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;margin:0 auto;display:table;">تسوق الآن</a>' }
        ],
        blog: [
            { type: 'text', content: '<h1>📰 مدونة التقنية</h1><p>آخر الأخبار في عالم التقنية</p>' },
            { type: 'section', content: '<div style="background:#161b22;padding:16px;border-radius:8px;margin-bottom:12px;"><h3>🚀 الذكاء الاصطناعي في 2026</h3><p>نظرة على أحدث التطورات...</p></div><div style="background:#161b22;padding:16px;border-radius:8px;"><h3>📱 أفضل تطبيقات 2026</h3><p>تطبيقات غيرت طريقة حياتنا...</p></div>' }
        ],
        portfolio: [
            { type: 'text', content: '<h1 style="text-align:center;">🎨 معرض أعمالي</h1>' },
            { type: 'section', content: '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;"><div style="background:#161b22;padding:40px;border-radius:8px;text-align:center;">🖼️ مشروع 1</div><div style="background:#161b22;padding:40px;border-radius:8px;text-align:center;">🖼️ مشروع 2</div></div>' }
        ],
        restaurant: [
            { type: 'text', content: '<h1 style="text-align:center;">🍽️ مطعم الذوق</h1><p style="text-align:center;">أشهى المأكولات الشرقية</p>' },
            { type: 'menu', content: '<ul style="list-style:none;display:flex;gap:16px;padding:0;justify-content:center;flex-wrap:wrap;"><li><a href="#">المقبلات</a></li><li><a href="#">الوجبات الرئيسية</a></li><li><a href="#">المشروبات</a></li><li><a href="#">الحلويات</a></li></ul>' },
            { type: 'button', content: '<a href="#" style="display:inline-block;background:#daa520;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;margin:0 auto;display:table;">📱 طلب عبر واتساب</a>' }
        ],
        landing: [
            { type: 'text', content: '<h1 style="text-align:center;font-size:36px;">🚀 انطلق معنا</h1><p style="text-align:center;font-size:18px;color:#8b949e;">حلول تقنية مبتكرة لأعمالك</p>' },
            { type: 'section', content: '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;"><div style="text-align:center;"><div style="font-size:32px;">⚡</div><h4>سرعة</h4></div><div style="text-align:center;"><div style="font-size:32px;">🔒</div><h4>أمان</h4></div><div style="text-align:center;"><div style="font-size:32px;">📈</div><h4>نمو</h4></div></div>' },
            { type: 'button', content: '<a href="#" style="display:inline-block;background:#238636;color:white;padding:12px 32px;border-radius:6px;text-decoration:none;margin:0 auto;display:table;font-size:18px;">ابدأ الآن مجاناً</a>' }
        ]
    };

    const templateElements = templates[type] || [];
    elements = templateElements.map((el, i) => ({
        id: nextId++,
        type: el.type,
        content: el.content,
        styles: {}
    }));
    selectedIndex = null;
    renderCanvas();
    document.getElementById('propertyPanel').innerHTML = '<p>اختر عنصرًا لتعديل خصائصه</p>';
    autoSaveProject();
}

// ===================== معاينة =====================
function previewSite() {
    const html = generateFullHTML();
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
}

// ===================== تصدير HTML =====================
function exportHTML() {
    const html = generateFullHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'site.html';
    a.click();
    URL.revokeObjectURL(url);
}

// ===================== توليد HTML كامل =====================
function generateFullHTML() {
    const content = elements.map(el => el.content).join('\n');
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>موقعي - SiteForge</title>
    <style>
        body { max-width: 1100px; margin: 40px auto; padding: 0 20px; background: #0d1117; color: #e6edf3; font-family: 'Segoe UI', sans-serif; line-height: 1.6; }
        a { color: #58a6ff; text-decoration: none; }
        a:hover { text-decoration: underline; }
        img { max-width: 100%; height: auto; }
        .container { padding: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        ${content}
    </div>
</body>
</html>`;
}

// ===================== AI Builder =====================
function showAIBuilder() {
    document.getElementById('aiModal').style.display = 'flex';
}

function closeAIModal() {
    document.getElementById('aiModal').style.display = 'none';
    document.getElementById('aiResult').innerHTML = '';
}

function setupAIModal() {
    // إغلاق النافذة عند الضغط خارجها
    window.onclick = function(event) {
        const modal = document.getElementById('aiModal');
        if (event.target === modal) {
            closeAIModal();
        }
    };
}

async function generateWithAI() {
    const prompt = document.getElementById('aiPrompt').value.trim();
    const siteType = document.getElementById('aiSiteType').value;
    const resultDiv = document.getElementById('aiResult');
    
    if (!prompt) {
        alert('✏️ من فضلك اكتب وصفاً للموقع');
        return;
    }

    resultDiv.innerHTML = '<div class="ai-loading">⏳ جاري إنشاء الموقع... هذا قد يستغرق بضع ثوان</div>';

    // محاكاة استجابة الذكاء الاصطناعي
    // في الواقع، ستستخدم OpenAI API أو أي خدمة أخرى
    setTimeout(() => {
        const generatedContent = generateSiteFromPrompt(prompt, siteType);
        resultDiv.innerHTML = generatedContent;
        
        // عرض زر لإضافة العناصر
        resultDiv.innerHTML += `
            <button onclick="applyAIGeneratedSite()" style="margin-top:16px;background:#238636;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;width:100%;">
                ✅ تطبيق الموقع
            </button>
        `;
        
        // تخزين النتيجة للتطبيق
        window.aiGeneratedElements = parseAIGeneratedElements(generatedContent);
    }, 2000);
}

function generateSiteFromPrompt(prompt, type) {
    // محاكاة توليد محتوى من الوصف
    const keywords = {
        'مطعم': ['🍽️ مطعم', 'قائمة طعام', 'أطباق شهية', 'حجز طاولة'],
        'سوري': ['مطبخ سوري', 'مشاوي', 'فتوش', 'كنافة'],
        'أسود وذهبي': ['لون أسود وذهبي', 'فخم', 'أنيق'],
        'واتساب': ['زر واتساب', 'تواصل مباشر'],
        'متجر': ['🛍️ متجر', 'منتجات', 'تسوق'],
        'برمجة': ['💻 برمجة', 'تطوير', 'تقنية'],
        'تصميم': ['🎨 تصميم', 'إبداع', 'جرافيك'],
        'تعليم': ['📚 تعليم', 'دورات', 'شهادات'],
        'صحة': ['🏥 صحة', 'طب', 'عافية']
    };

    let title = 'موقعي';
    let description = 'مرحباً بكم في موقعي';
    
    // استخراج الكلمات المفتاحية من النص
    for (const [key, values] of Object.entries(keywords)) {
        if (prompt.includes(key)) {
            title = values[0] || title;
            description = values[1] || description;
        }
    }

    // تحديد النمط حسب النوع
    const styles = {
        personal: 'text-align:center;',
        business: 'text-align:center;',
        restaurant: 'text-align:center;',
        portfolio: 'text-align:center;',
        blog: '',
        landing: 'text-align:center;',
        store: 'text-align:center;'
    };

    const style = styles[type] || '';

    return `
        <div style="background:#161b22;padding:16px;border-radius:8px;">
            <h2 style="color:#58a6ff;${style}">${title}</h2>
            <p style="${style}">${description}</p>
            <p style="${style};color:#8b949e;">${prompt}</p>
            <hr style="border-color:#30363d;margin:12px 0;">
            <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
                <span style="background:#21262d;padding:4px 12px;border-radius:12px;font-size:12px;">${type}</span>
                <span style="background:#21262d;padding:4px 12px;border-radius:12px;font-size:12px;">${new Date().getFullYear()}</span>
            </div>
        </div>
    `;
}

function parseAIGeneratedElements(html) {
    // تحويل HTML المُولّد إلى عناصر
    return [
        {
            type: 'text',
            content: html,
            styles: {}
        }
    ];
}

function applyAIGeneratedSite() {
    if (window.aiGeneratedElements) {
        elements = window.aiGeneratedElements;
        renderCanvas();
        closeAIModal();
        autoSaveProject();
        alert('✅ تم تطبيق الموقع المُولّد بالذكاء الاصطناعي!');
    }
}

// ===================== إدارة النطاقات المخصصة =====================

function addCustomDomain(siteId, domain) {
    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
        domain = 'https://' + domain;
    }
    
    try {
        new URL(domain);
        customDomains[siteId] = domain;
        localStorage.setItem('siteforge_domains', JSON.stringify(customDomains));
        return true;
    } catch (e) {
        alert('❌ الرابط غير صالح. تأكد من كتابته بشكل صحيح (مثال: example.com)');
        return false;
    }
}

function getSiteUrl(siteId, defaultPath = '') {
    const domain = customDomains[siteId];
    if (domain) {
        return domain + defaultPath;
    }
    const username = 'your-username';
    return `https://${username}.github.io/SiteForge/sites/${siteId}${defaultPath}`;
}

function showDomainSettings(siteId) {
    const currentDomain = customDomains[siteId] || '';
    const panel = document.getElementById('propertyPanel');
    
    panel.innerHTML = `
        <h3>🌐 إعدادات النطاق</h3>
        <label>النطاق المخصص</label>
        <input type="url" id="domainInput" placeholder="example.com" value="${currentDomain.replace(/^https?:\/\//, '')}" />
        <small style="color:#8b949e;display:block;margin-bottom:8px;">اتركه فارغاً لاستخدام النطاق الافتراضي</small>
        
        <button onclick="saveDomain('${siteId}')" style="background:#238636;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;width:100%;">
            💾 حفظ النطاق
        </button>
        
        <hr style="border-color:#30363d;margin:12px 0;" />
        
        <div style="background:#0d1117;padding:12px;border-radius:6px;">
            <p style="font-size:12px;color:#8b949e;">🔗 رابط الموقع:</p>
            <p style="word-break:break-all;font-size:14px;">
                <a href="${getSiteUrl(siteId)}" target="_blank" style="color:#58a6ff;">
                    ${getSiteUrl(siteId)}
                </a>
            </p>
        </div>
        
        <button onclick="copySiteUrl('${siteId}')" style="background:#1f6feb;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;width:100%;margin-top:8px;">
            📋 نسخ الرابط
        </button>
    `;
}

function saveDomain(siteId) {
    const input = document.getElementById('domainInput');
    const domain = input.value.trim();
    
    if (domain) {
        if (addCustomDomain(siteId, domain)) {
            alert('✅ تم حفظ النطاق المخصص بنجاح!');
            showDomainSettings(siteId);
        }
    } else {
        delete customDomains[siteId];
        localStorage.setItem('siteforge_domains', JSON.stringify(customDomains));
        alert('🗑️ تم إلغاء النطاق المخصص والعودة للنطاق الافتراضي');
        showDomainSettings(siteId);
    }
}

function copySiteUrl(siteId) {
    const url = getSiteUrl(siteId);
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            alert('✅ تم نسخ الرابط: ' + url);
        }).catch(() => {
            const input = document.createElement('input');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            alert('✅ تم نسخ الرابط: ' + url);
        });
    }
}

// ===================== النشر على GitHub =====================
async function publishToGitHub() {
    const siteId = prompt('🏷️ أدخل معرف الموقع (سيظهر في الرابط):', 'my-site-' + Date.now());
    if (!siteId) return;

    const token = prompt('🔑 أدخل GitHub Token الخاص بك:');
    if (!token) return;

    const repo = prompt('📁 اسم المستودع (مثال: username/repo):');
    if (!repo) return;

    const html = generateFullHTML();
    const fileName = `sites/${siteId}/index.html`;

    try {
        const useCustomDomain = confirm('🌐 هل تريد إضافة نطاق مخصص؟ (اضغط إلغاء للتخطي)');
        if (useCustomDomain) {
            const domain = prompt('أدخل النطاق المخصص (مثال: example.com):');
            if (domain) {
                addCustomDomain(siteId, domain);
            }
        }

        const response = await fetch(`https://api.github.com/repos/${repo}/contents/${fileName}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `نشر موقع ${siteId} من SiteForge`,
                content: btoa(unescape(encodeURIComponent(html)))
            })
        });

        if (response.ok) {
            const data = await response.json();
            const siteUrl = getSiteUrl(siteId);
            
            alert(`✅ تم النشر بنجاح!\n\n🔗 رابط الموقع:\n${siteUrl}\n\n📝 النطاق المخصص: ${customDomains[siteId] || 'غير مضاف'}`);
            showDomainSettings(siteId);
        } else {
            const error = await response.json();
            alert('❌ حدث خطأ: ' + (error.message || response.status));
        }
    } catch (error) {
        alert('❌ خطأ في الاتصال: ' + error.message);
    }
}

function addDomainManager() {
    const toolbar = document.querySelector('.actions');
    const domainBtn = document.createElement('button');
    domainBtn.innerHTML = '🌐 نطاقات';
    domainBtn.onclick = () => {
        const siteId = prompt('🏷️ أدخل معرف الموقع لإدارة نطاقه:');
        if (siteId) {
            showDomainSettings(siteId);
        }
    };
    domainBtn.style.background = '#1f6feb';
    domainBtn.style.borderColor = '#388bfd';
    domainBtn.style.color = 'white';
    toolbar.appendChild(domainBtn);
}

// ===================== دعم السحب باللمس للجوال =====================
let touchDragData = null;

function addHapticFeedback() {
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
}

function setupDragAndDrop() {
    const elementsList = document.querySelectorAll('.elements div');
    const canvas = document.getElementById('canvas');

    elementsList.forEach(el => {
        el.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('type', el.dataset.type);
        });

        el.addEventListener('touchstart', (e) => {
            touchDragData = {
                type: el.dataset.type,
                element: el
            };
            el.style.opacity = '0.5';
        });

        el.addEventListener('touchend', () => {
            if (touchDragData) {
                touchDragData.element.style.opacity = '1';
            }
        });
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
    });

    canvas.addEventListener('touchend', (e) => {
        if (touchDragData) {
            const touch = e.changedTouches[0];
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            
            if (target && (target.closest('.canvas') || target.closest('#canvas'))) {
                addElement(touchDragData.type);
            }
            
            touchDragData.element.style.opacity = '1';
            touchDragData = null;
        }
    });

    canvas.addEventListener('dragover', (e) => e.preventDefault());
    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('type');
        if (type) addElement(type);
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('.elements div') || e.target.closest('.templates div')) {
            addHapticFeedback();
        }
    });
}
