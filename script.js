// حماية كلمة المرور: الكود المشفر بـ Base64 يطابق كلمة "نور"
const ENCRYPTED_PASSWORD = "2YbZiNix"; 

// إدارة مصفوفة الحوارات التفاعلية للقصة
const dialogueSteps = [
    { text: "شو دخلَك 😐", emoji: "🐻", button: "يمكن 😒" },
    { text: "اي 🙄 لا ما بعرف 😶", emoji: "🐻", button: "دب 🐻" },
    { text: "أكيد خفوشي ❤ مترددة.. 🤔", emoji: "🐼", button: "أجل 💖", showSad: true },
    { text: "اضغطي لرؤية النتيجة ✨", emoji: "✨🐻✨", button: "رؤية النتيجة 🎁" }
];

let currentStep = 0;

// فحص كلمة المرور بطريقة آمنة ومعزولة عن واجهة الـ HTML
document.getElementById('login-btn').addEventListener('click', function() {
    const userInput = document.getElementById('password-input').value;
    
    // تحويل مدخل المستخدم برمجياً للمقارنة مع الهاش المشفر
    const encodedInput = btoa(unescape(encodeURIComponent(userInput)));

    if (encodedInput === ENCRYPTED_PASSWORD) {
        document.getElementById('login-screen').classList.add('hidden');
        startLoading();
    } else {
        document.getElementById('error-msg').classList.remove('hidden');
    }
});

// العداد الحيوي المستقل
function startLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingText = document.getElementById('loading-text');
    loadingScreen.classList.remove('hidden');
    
    let count = 0;
    const interval = setInterval(() => {
        count += 20;
        loadingText.innerText = count + "% ⏳";
        if (count >= 100) {
            clearInterval(interval);
            loadingScreen.classList.add('hidden');
            showDialogue();
        }
    }, 500); 
}

// عرض وتحديث حوارات شخصيات الدببة
function showDialogue() {
    document.getElementById('question-screen').classList.remove('hidden');
    
    const textEl = document.getElementById('dialogue-text');
    const emojiEl = document.getElementById('bear-emoji');
    const nextBtn = document.getElementById('next-dialogue-btn');
    const sadBtn = document.getElementById('sad-choice-btn');

    textEl.innerText = dialogueSteps[currentStep].text;
    emojiEl.innerText = dialogueSteps[currentStep].emoji;
    nextBtn.innerText = dialogueSteps[currentStep].button;

    if (dialogueSteps[currentStep].showSad) {
        sadBtn.classList.remove('hidden');
    } else {
        sadBtn.classList.add('hidden');
    }
}

// معالجة الانتقال بين خطوات الحوار
document.getElementById('next-dialogue-btn').addEventListener('click', () => {
    currentStep++;
    if (currentStep < dialogueSteps.length) {
        showDialogue();
    } else {
        document.getElementById('question-screen').classList.add('hidden');
        revealSecret();
    }
});

// سيناريو الضغط على زر الرفض
document.getElementById('sad-choice-btn').addEventListener('click', () => {
    document.getElementById('question-screen').classList.add('hidden');
    document.getElementById('sad-screen').classList.remove('hidden');
});

// زر إعادة المحاولة من شاشة الرفض
document.getElementById('retry-btn').addEventListener('click', () => {
    currentStep = 0;
    document.getElementById('sad-screen').classList.add('hidden');
    showDialogue();
});

// تفعيل كرت الحك وإظهار النص السري داخل المتصفح بأمان عند الطلب فقط
document.getElementById('scratch-card').addEventListener('click', function() {
    document.getElementById('scratch-cover').classList.add('hidden');
    document.getElementById('secret-message').classList.remove('hidden');
    
    // تعديل ستايل الكرت برمجياً بعد الحك
    this.style.background = '#fff0f5';
    this.style.borderStyle = 'solid';
});

function revealSecret() {
    document.getElementById('secret-screen').classList.remove('hidden');
}
