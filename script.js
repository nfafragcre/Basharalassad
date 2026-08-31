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
            { type: 'text', content: '<h1 style="text-align:center;">🍽️ مطعم الذوق</h1><
