function createLink() {

    const originalUrl =
        document.getElementById("originalUrl").value.trim();

    const shortName =
        document.getElementById("shortName").value.trim();

    const result =
        document.getElementById("result");


    // التحقق من الرابط
    if (!originalUrl) {

        result.innerHTML =
            "❌ أدخل الرابط الأصلي.";

        return;
    }


    // التحقق من أن الرابط صحيح
    try {

        const url = new URL(originalUrl);

        if (url.protocol !== "http:" && url.protocol !== "https:") {
            throw new Error();
        }

    } catch {

        result.innerHTML =
            "❌ الرابط الأصلي غير صحيح.";

        return;
    }


    // التحقق من الاسم المختصر
    if (!shortName) {

        result.innerHTML =
            "❌ أدخل اسم الرابط المختصر.";

        return;
    }


    /*
     * السماح بـ:
     * - الأحرف العربية
     * - الأحرف الإنجليزية
     * - الأرقام
     * - الشرطة -
     * - الشرطة السفلية _
     */
    const allowedName =
        /^[\u0600-\u06FFa-zA-Z0-9_-]+$/u;


    if (!allowedName.test(shortName)) {

        result.innerHTML =
            "❌ استخدم الأحرف العربية أو الإنجليزية أو الأرقام فقط.";

        return;
    }


    // إنشاء الرابط المختصر
    const baseUrl =
        window.location.origin +
        window.location.pathname.replace(/\/$/, "");


    /*
     * encodeURIComponent يحول العربية إلى
     * ترميز URL الصحيح، وهذا طبيعي.
     */
    const encodedName =
        encodeURIComponent(shortName);


    const shortUrl =
        baseUrl + "/" + encodedName;


    // عرض النتيجة
    result.innerHTML = `

        <div class="success">
            ✅ تم إنشاء الرابط
        </div>

        <br>

        <strong>الرابط المختصر:</strong>

        <br><br>

        <a
            href="${shortUrl}"
            target="_blank"
            rel="noopener noreferrer"
        >
            ${shortUrl}
        </a>

        <br><br>

        <button
            onclick="copyLink('${shortUrl.replace(/'/g, "\\'")}')"
        >
            📋 نسخ الرابط
        </button>

        <br><br>

        <small>
            الرابط الأصلي:
            <br>
            ${escapeHtml(originalUrl)}
        </small>

    `;
}


// نسخ الرابط
function copyLink(url) {

    navigator.clipboard.writeText(url)
        .then(() => {

            alert("✅ تم نسخ الرابط");

        })
        .catch(() => {

            alert("❌ لم يتمكن المتصفح من نسخ الرابط");

        });
}


// حماية النصوص التي تظهر داخل HTML
function escapeHtml(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
