
// --- Config ---
const API_KEY = 'f749be486c7d4b8086fd36a881cee470'; // One Call 3.0 key
const LAT = '44.91233400591799';
const LON = '-93.31721559338696';

// --- Moon emoji by phase decimal ---
function getMoonEmoji(phase) {
  if (phase === 0 || phase === 1) return "🌑";
  if (phase < 0.25) return "🌒";
  if (phase === 0.25) return "🌓";
  if (phase < 0.5) return "🌔";
  if (phase === 0.5) return "🌕";
  if (phase < 0.75) return "🌖";
  if (phase === 0.75) return "🌗";
  return "🌘";
}

// --- Time & Date ---
function updateTimeAndDate() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  document.getElementById('time').textContent = `${hours}:${minutes}`;

  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  document.getElementById('date').textContent = now.toLocaleDateString(undefined, options);
}

// --- Helpers ---
function formatTimeFromUnix(unix) {
  return new Date(unix * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

// --- Main fetch logic using One Call 3.0 ---
async function fetchWeatherData() {
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${LAT}&lon=${LON}&units=imperial&exclude=minutely,hourly,alerts&appid=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // --- Current conditions ---
    const current = data.current;
    const iconCode = current.weather[0].icon;
    const desc = current.weather[0].description;
    const temp = Math.round(current.temp);
    const tempMin = Math.round(data.daily[0].temp.min);
    const tempMax = Math.round(data.daily[0].temp.max);

    const iconFile = mapOWMIconToSVG(iconCode);
    document.getElementById('weather-icon').data = `weather-icons/${iconFile}.svg`;
    document.getElementById('weather-icon').alt = desc;
    document.getElementById('temp-now').textContent = `${temp}°`;
    document.getElementById('weather-desc').textContent = desc;
    document.getElementById('weather-range').textContent = `${tempMax}° / ${tempMin}°`;


    updateSunMoonTimes(data);


    // --- Moon phase ---
    var svg = document.getElementById("moon");

    updateMoonPhase(data.daily[0].moon_phase);
    svg.setAttribute("viewBox", "0 0 200 200"); 
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");


    // --- Forecast (next 3 days, skip today) ---
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const day = data.daily[i];
      const fIcon = day.weather[0].icon;
      const fDesc = day.weather[0].description;
      const fMax = Math.round(day.temp.max);
      const fMin = Math.round(day.temp.min);

      const dateObj = new Date(day.dt * 1000);
      const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'short' }); // e.g. "Mon"

      const forecastIconFile = mapOWMIconToSVG(fIcon);
      const div = document.createElement('div');
      div.className = 'forecast-day';
      div.innerHTML = `
        <div class="forecast-day-name">${dayName}</div>
        <object type="image/svg+xml" data="weather-icons/${forecastIconFile}.svg" class="forecast-icon"></object>
        <div class="forecast-desc">${fDesc}</div>
        <div class="forecast-range">${fMax}° / ${fMin}°</div>
      `;
      forecastContainer.appendChild(div);

    }
  } catch (err) {
    console.error('One Call API error:', err);
  }
}

// --- Describe moon phase by decimal value ---
function describeMoonPhase(val) {
  if (val === 0 || val === 1) return "New Moon";
  if (val === 0.25) return "First Quarter";
  if (val === 0.5) return "Full Moon";
  if (val === 0.75) return "Last Quarter";
  if (val < 0.25) return "Waxing Crescent";
  if (val < 0.5) return "Waxing Gibbous";
  if (val < 0.75) return "Waning Gibbous";
  return "Waning Crescent";
}

function mapOWMIconToSVG(owmCode) {
  const map = {
    "01d": "clear-day",
    "01n": "clear-night",
    "02d": "partly-cloudy-day",
    "02n": "partly-cloudy-night",
    "03d": "cloudy",
    "03n": "cloudy",
    "04d": "overcast-day",
    "04n": "overcast-night",
    "09d": "rain",
    "09n": "rain",
    "10d": "rain",
    "10n": "rain",
    "11d": "thunderstorms-day",
    "11n": "thunderstorms-night",
    "13d": "snow",
    "13n": "snow",
    "50d": "mist",
    "50n": "mist"
  };
  return map[owmCode] || "na";
}

function formatTimeFromUnix(unixTime) {
  const date = new Date(unixTime * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function updateSunMoonTimes(data) {
  document.getElementById('sunrise-time').textContent = formatTimeFromUnix(data.current.sunrise);
  document.getElementById('sunset-time').textContent = formatTimeFromUnix(data.current.sunset);
  document.getElementById('moonrise-time').textContent = formatTimeFromUnix(data.daily[0].moonrise);
  document.getElementById('moonset-time').textContent = formatTimeFromUnix(data.daily[0].moonset);
}

function getMoonPhaseName(phase) {
  const phases = [
    "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
    "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"
  ];
  const index = Math.floor(phase * 8) % 8;
  return phases[index];
}

function updateMoonPhase(moonPhaseFloat) {
  // Set name
  const name = getMoonPhaseName(moonPhaseFloat);
  document.getElementById("moon-phase-name").textContent = name;

  // Clear old SVG
  const container = document.getElementById("moon");
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // Render new SVG using library
  phase_junk(moonPhaseFloat);
}



// --- Init ---
updateTimeAndDate();
fetchWeatherData();

setInterval(updateTimeAndDate, 1000);
setInterval(fetchWeatherData, 10 * 60 * 1000); // every 10 minutes
