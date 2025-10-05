// CLIENT_ID funcional de tu proyecto base
const CLIENT_ID = "263535346263-skspi078da7mhq26chnsfn2iegnc23d0.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid";

let tokenClient;

window.addEventListener("load", () => {
    const info = document.getElementById("user-info");

    if (!window.google || !google.accounts || !google.accounts.oauth2) {
        info.textContent = "❌ No se cargó Google Identity Services.";
        return;
    }

    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        prompt: "consent",
        callback: (resp) => {
            if (resp && resp.access_token) {
                saveToken(resp.access_token);
                info.textContent = "✅ Conectado correctamente.";
                window.location.href = "app.html";
            } else {
                info.textContent = "❌ No se pudo obtener el token.";
            }
        }
    });

    document.getElementById("login-btn").addEventListener("click", () => {
        tokenClient.requestAccessToken({ prompt: "consent" });
    });
});
