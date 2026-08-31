// ===================== الحالة =====================
let elements = [];
let selectedIndex = null;
let nextId = 1;

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
}

function getDefaultContent(type) {
    const defaults = {
        text: '<h3>نص جديد</h3><p>اكتب المحتوى هنا...</p>',
        image: '<img src="https://via.placeholder.com/300x200" alt="صورة" style="max-width:100%;">',
        button: '<a href="#" style="display:inline-block;background:#238636;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;">زر</a>',
        video: '<iframe width="100%" height="200" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>',
        section: '<div style="padding:20px;background:#161b22;border-radius:8px;border:1px solid #30363d;"><h3>قسم جديد</h3><p>محتوى القسم...</p></div>',
        menu: '<ul style="list-style:none;display:flex;gap:16px;padding:0;"><li><a href="#">الرئيسية</a></li><li><a href="#">خدمات</a></li><li><a href="#">اتصل</a></li></ul>'
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
    `;
}

// ===================== تحديث المحتوى والخصائص =====================
function updateContent(index, value) {
    elements[index].content = value;
    renderCanvas();
}

function updateStyle(index, property, value) {
    elements[index].styles[property] = value;
    renderCanvas();
}

// ===================== حذف عنصر =====================
function deleteElement(index, event) {
    event.stopPropagation();
    elements.splice(index, 1);
    selectedIndex = null;
    renderCanvas();
    document.getElementById('propertyPanel').innerHTML = '<p>اختر عنصرًا لتعديل خصائصه</p>';
}

// ===================== تحميل قالب =====================
function loadTemplate(type) {
    // محاكاة تحميل قالب
    const templates = {
        personal: [
            { type: 'text', content: '<h1 style="text-align:center;">👤 مرحباً، أنا أحمد</h1><p style="text-align:center;">مطور مواقع</p>' },
            { type: 'button', content: '<a href="#" style="display:inline-block;background:#238636;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;margin:0 auto;display:table;">تواصل معي</a>' }
        ],
        store: [
            { type: 'text', content: '<h1 style="text-align:center;">🛍️ متجر الإلكترونيات</h1>' },
            { type: 'section', content: '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;"><div style="background:#161b22;padding:16px;border-radius:8px;">📱 هاتف ذكي<br><strong>$599</strong></div><div style="background:#161b22;padding:16px;border-radius:8px;">💻 لابتوب<br><strong>$899</strong></div><div style="background:#161b22;padding:16px;border-radius:8px;">🎧 سماعات<br><strong>$99</strong></div></div>' }
        ],
        blog: [
            { type: 'text', content: '<h1>📰 مدونة التقنية</h1><p>آخر الأخبار في عالم التقنية</p>' },
            { type: 'section', content: '<div style="background:#161b22;padding:16px;border-radius:8px;margin-bottom:12px;"><h3>🚀 الذكاء الاصطناعي في 2026</h3><p>نظرة على أحدث التطورات...</p></div><div style="background:#161b22;padding:16px;border-radius:8px;"><h3>📱 أفضل تطبيقات 2026</h3><p>تطبيقات غيرت طريقة حياتنا...</p></div>' }
        ],
        portfolio: [
            { type: 'text', content: '<h1 style="text-align:center;">🎨 معرض أعمالي</h1>' },
            { type: 'section', content: '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;"><div style="background:#161b22;padding:40px;border-radius:8px;text-align:center;">🖼️ مشروع 1</div><div style="background:#161b22;padding:40px;border-radius:8px;text-align:center;">🖼️ مشروع 2</div></div>' }
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
        body { max-width: 900px; margin: 40px auto; padding: 0 20px; background: #0d1117; color: #e6edf3; font-family: 'Segoe UI', sans-serif; }
        a { color: #58a6ff; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
}

// ===================== النشر على GitHub =====================
function publishToGitHub() {
    // محاكاة - ستضيف التوثيق الحقيقي لاحقاً
    alert('🚀 سيتم نشر موقعك على:\nusername.github.io/site/my-site\n\n(تتطلب إعداد GitHub API)');
    console.log('HTML المولد:', generateFullHTML());
}

// ===================== السحب والإفلات =====================
document.addEventListener('DOMContentLoaded', () => {
    const elementsList = document.querySelectorAll('.elements div');
    const canvas = document.getElementById('canvas');

    elementsList.forEach(el => {
        el.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('type', el.dataset.type);
        });
    });

    canvas.addEventListener('dragover', (e) => e.preventDefault());
    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('type');
        if (type) addElement(type);
    });
});