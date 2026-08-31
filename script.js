function createLink() {

    const originalUrl =
        document.getElementById("originalUrl").value.trim();

    const shortName =
        document.getElementById("shortName").value.trim();

    const result =
        document.getElementById("result");


    if (!originalUrl) {

        result.innerHTML =
            "❌ أدخل الرابط الأصلي.";

        return;
    }


    if (!shortName) {

        result.innerHTML =
            "❌ أدخل اسم الرابط المختصر.";

        return;
    }


    try {

        new URL(originalUrl);

    } catch {

        result.innerHTML =
            "❌ الرابط الأصلي غير صحيح.";

        return;
    }


    if (!/^[a-zA-Z0-9_-]+$/.test(shortName)) {

        result.innerHTML =
            "❌ استخدم حروفًا إنجليزية أو أرقامًا أو - أو _ فقط.";

        return;
    }


    const shortUrl =
        window.location.origin +
        window.location.pathname.replace(/\/$/, "") +
        "/" +
        shortName;


    result.innerHTML = `
        <strong>تم إنشاء الرابط:</strong><br><br>

        <a href="${shortUrl}" target="_blank">
            ${shortUrl}
        </a>

        <br><br>

        <small>
            الرابط الأصلي:<br>
            ${originalUrl}
        </small>
    `;
}
