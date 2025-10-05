let evMap, evMarker, selectedLatLon = null, selectedEvent = null;
// Code asisted by OpenAI ChatGPT (GPT-5)

function initEventsMap() {
    evMap = L.map('map').setView([20.97, -89.62], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(evMap);

    evMap.on('click', (e) => {
        const lat = +e.latlng.lat.toFixed(4);
        const lon = +e.latlng.lng.toFixed(4);
        selectedLatLon = { lat, lon };

        if (evMarker) evMarker.setLatLng(e.latlng);
        else evMarker = L.marker(e.latlng).addTo(evMap);

        tryUpdateEventForecast();
    });
}

async function renderEventsList() {
    const container = document.getElementById("events-list");
    try {
        const events = await fetchEvents();
        if (!events.length) {
            container.innerHTML = "<p>No hay eventos próximos.</p>";
            return;
        }
        container.innerHTML = "";
        events.forEach((ev, idx) => {
            const card = document.createElement("div");
            card.className = "event-card";
            card.innerHTML = `
        <strong>${ev.title}</strong><br>
        Fecha: ${ev.dateISO}<br>
        <button data-idx="${idx}" class="btn-sm">Usar este evento</button>
      `;
            container.appendChild(card);

            card.querySelector("button").addEventListener("click", () => {
                selectedEvent = ev;
                tryUpdateEventForecast();
            });
        });
    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>⚠️ Error al cargar eventos.</p>";
    }
}

async function tryUpdateEventForecast() {
    const out = document.getElementById("event-forecast");
    const adviceEl = document.getElementById("event-advice");
    if (!selectedEvent || !selectedLatLon) {
        out.innerHTML = "<p class='muted small'>Selecciona un evento y una ubicación.</p>";
        adviceEl.textContent = "";
        return;
    }

    out.innerHTML = "Calculando pronóstico…";
    adviceEl.textContent = "";
    const { lat, lon } = selectedLatLon;
    const { dateISO, title } = selectedEvent;

    try {
        const data = await fetchDailyForDate(lat, lon, dateISO);
        const rec = findDayRecord(data, dateISO);
        if (!rec) {
            out.innerHTML = `<p>No hay datos disponibles cerca de ${dateISO}. Prueba otra ubicación o fecha.</p>`;
            return;
        }

        out.innerHTML = `
      <h4>Pronóstico para "${title}"</h4>
      <div class="day">
        <strong>${rec.date}</strong><br>
        Max: ${rec.maxC} °C<br>
        Min: ${rec.minC} °C<br>
        Lluvia: ${rec.rainMm} mm
      </div>
    `;

        const advice = buildAdvice({ maxC: rec.maxC, minC: rec.minC, rainMm: rec.rainMm }, `${lat}, ${lon}`);
        adviceEl.textContent = advice;
    } catch (err) {
        console.error(err);
        out.innerHTML = "❌ Error al obtener pronóstico.";
    }
}

function wireLogoutEvents() {
    document.getElementById("logout").addEventListener("click", () => {
        clearToken();
        alert("Sesión cerrada");
        window.location.href = "index.html";
    });
}

window.addEventListener("load", () => {
    const token = getToken();
    if (!token) {
        alert("Sesión expirada, inicia sesión nuevamente.");
        window.location.href = "index.html";
        return;
    }
    initEventsMap();
    renderEventsList();
    wireLogoutEvents();
});

