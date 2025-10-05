// === Obtiene los 5 eventos del calendario de Google (futuro → pasado) ===
async function fetchEvents() {
    const token = getToken();
    if (!token) throw new Error("No hay token de acceso");

    const url = "https://www.googleapis.com/calendar/v3/calendars/primary/events" +
        "?maxResults=20&orderBy=startTime&singleEvents=true";

    const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!resp.ok) throw new Error("Error al consultar Google Calendar");

    const data = await resp.json();
    const items = Array.isArray(data.items) ? data.items : [];

    // Normalizar fechas (maneja eventos con dateTime o solo date)
    const normalized = items
        .map(ev => {
            let startStr = ev.start?.dateTime || ev.start?.date || ev.created;
            const startDate = new Date(startStr);
            return { ...ev, startDate };
        })
        .filter(ev => !isNaN(ev.startDate.getTime()));

    // ✅ Orden descendente (más próximos primero → más antiguos al final)
    const five = normalized
        .sort((a, b) => b.startDate - a.startDate)
        .slice(0, 5);

    // Re-mapea con los datos útiles que usaremos en la interfaz
    return five.map(ev => ({
        title: ev.summary || "(Sin título)",
        dateISO: toLocalISO(ev.startDate),
        raw: ev
    }));
}
