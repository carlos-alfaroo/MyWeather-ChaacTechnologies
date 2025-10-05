// === Open-Meteo: clima actual + 5 días ===
async function fetchFiveDay(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Error al obtener datos del clima");
    return await resp.json();
}

// === Open-Meteo: rango alrededor de una fecha concreta (para eventos) ===
async function fetchDailyForDate(lat, lon, dateISO) {
    const d = new Date(dateISO);
    const start = new Date(d); start.setDate(d.getDate() - 3);
    const end = new Date(d); end.setDate(d.getDate() + 3);
    const sISO = toLocalISO(start);
    const eISO = toLocalISO(end);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&start_date=${sISO}&end_date=${eISO}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Error al obtener datos del clima (fecha)");
    return await resp.json();
}

// === Busca un día específico dentro del arreglo 'daily' ===
function findDayRecord(data, targetISO) {
    const idx = data.daily.time.findIndex(d => d === targetISO);
    if (idx === -1) return null;
    return {
        date: data.daily.time[idx],
        maxC: data.daily.temperature_2m_max[idx],
        minC: data.daily.temperature_2m_min[idx],
        rainMm: data.daily.precipitation_sum[idx]
    };
}

// === Recomendaciones con ifs ===
function buildAdvice(stats, placeLabel) {
    const { maxC, minC, rainMm } = stats;
    let msg = [];

    // Lluvia
    if (rainMm >= 7) {
        msg.push(`☔ En ${placeLabel} se espera lluvia fuerte (${rainMm} mm). Reprograma o elige entorno cerrado.`);
    } else if (rainMm >= 3) {
        msg.push(`🌦️ Lluvia ligera en ${placeLabel} (${rainMm} mm). Lleva impermeable / paraguas.`);
    } else {
        msg.push(`🌤️ Poca probabilidad de lluvia (${rainMm} mm).`);
    }

    // Calor
    if (maxC >= 35) {
        msg.push(`🔥 Muy caluroso (max ${maxC} °C). Hidrátate y evita el sol del mediodía.`);
    } else if (maxC >= 30) {
        msg.push(`☀️ Caluroso (max ${maxC} °C). Ropa ligera y protector solar.`);
    }

    // Frío
    if (minC <= 10) {
        msg.push(`❄️ Madrugada/frío (min ${minC} °C). Lleva abrigo.`);
    }

    return msg.join(" ");
}
