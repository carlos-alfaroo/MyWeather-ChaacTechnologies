// Code asisted by OpenAI ChatGPT (GPT-5)
let map, marker;

function initMap() {
    map = L.map('map').setView([20.97, -89.62], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', async (e) => {
        const lat = e.latlng.lat.toFixed(4);
        const lon = e.latlng.lng.toFixed(4);

        if (marker) marker.setLatLng(e.latlng);
        else marker = L.marker(e.latlng).addTo(map);

        const panel = document.getElementById("coords");
        panel.innerHTML = `
      <strong>Ubicación seleccionada:</strong><br>
      Latitud: ${lat}<br>
      Longitud: ${lon}<br><br>
      <em>Consultando clima...</em>
    `;

        try {
            const data = await fetchFiveDay(lat, lon);
            renderWeather(lat, lon, data);
        } catch (err) {
            panel.innerHTML = "❌ Error al obtener el clima.";
            console.error(err);
        }
    });
}

function renderWeather(lat, lon, data) {
    const container = document.getElementById("coords");

    const current = data.current_weather;
    const time = data.daily.time;
    const max = data.daily.temperature_2m_max;
    const min = data.daily.temperature_2m_min;
    const rain = data.daily.precipitation_sum;

    let html = `
    <strong>Ubicación:</strong> ${lat}, ${lon}<br>
    <strong>Temperatura actual:</strong> ${current.temperature} °C<br>
    <strong>Viento:</strong> ${current.windspeed} km/h<br><hr>
    <h4>Pronóstico 5 días</h4>
  `;

    html += `<div class="forecast-grid">`;
    for (let i = 0; i < 5; i++) {
        html += `
      <div class="day">
        <strong>${time[i]}</strong><br>
        Max: ${max[i]} °C<br>
        Min: ${min[i]} °C<br>
        Lluvia: ${rain[i]} mm
      </div>
    `;
    }
    html += `</div>`;

    const todayStats = { maxC: max[0], minC: min[0], rainMm: rain[0] };
    const advice = buildAdvice(todayStats, `${lat}, ${lon}`);
    html += `<hr><h4>Recomendaciones</h4><div class="advice">${advice}</div>`;

    container.innerHTML = html;
}

function wireLogout() {
    document.getElementById("logout").addEventListener("click", () => {
        clearToken();
        alert("Sesión cerrada correctamente");
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
    initMap();
    wireLogout();
});

