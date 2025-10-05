// Code asisted by OpenAI ChatGPT (GPT-5)
function saveToken(token) { localStorage.setItem("mw_token", token); }
function getToken() { return localStorage.getItem("mw_token"); }
function clearToken() { localStorage.removeItem("mw_token"); }

// Formatea YYYY-MM-DD local
function toLocalISO(d) {
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

