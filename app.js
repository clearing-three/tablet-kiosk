// --- Config ---
const WEATHER_API_KEY = 'f749be486c7d4b8086fd36a881cee470';
const GEO_API_KEY = '427038ba33484b68a108126e21c197f4';
const ZIP = '55410';
const COUNTRY = 'US';
const LATITUDE = '44.91233400591799';
const LONGITUDE = '-93.31721559338696';

// --- Moon phase emoji map ---
const emojiMap = {
  "New Moon": "🌑",
  "Waxing Crescent": "🌒",
  "First Quarter": "🌓",
  "Waxing Gibbous": "🌔",
  "Full Moon": "🌕",
  "Waning Gibbous": "🌖",
  "Last Quarter": "🌗",
  "Waning Crescent": "🌘"
};

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
function formatTimeFromUnix(unixTimestamp) {
  return new Date(unixTimestamp * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

// --- Current weather ---
async function fetchCurrentWeather() {
  const url = `https://api.openweathermap.org/data/2.5/weather?zip=${ZIP},${COUNTRY}&units=imperial&appid=${WEATHER_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const tempMin = Math.round(data.main.temp_min);
    const tempMax = Math.round(data.main.temp_max);

    const sunrise = formatTimeFromUnix(data.sys.sunrise);
    const sunset = formatTimeFromUnix(data.sys.sunset);
    document.getElementById('sunrise-time').textContent = sunrise;
    document.getElementById('sunset-time').textContent = sunset;

    const icon = document.getElementById('weather-icon');
    icon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    icon.alt = desc;

    document.getElementById('temp-now').textContent = `${temp}°`;
    document.getElementById('weather-desc').textContent = desc;
    document.getElementById('weather-range').textContent = `${tempMax}° / ${tempMin}°`;
  } catch (err) {
    console.error('Weather fetch error:', err);
  }
}

// --- 3-day forecast ---
async function fetchForecast() {
  const url = `https://api.openweathermap.org/data/2.5/forecast?zip=${ZIP},${COUNTRY}&units=imperial&appid=${WEATHER_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    const forecastsByDay = {};
    data.list.forEach(entry => {
      const dateTime = new Date(entry.dt * 1000);
      const date = dateTime.toISOString().split('T')[0];
      if (!forecastsByDay[date]) forecastsByDay[date] = [];
      forecastsByDay[date].push(entry);
    });

    const today = new Date().toISOString().split('T')[0];
    const upcomingDays = Object.keys(forecastsByDay)
      .filter(d => d > today)
      .slice(0, 3);

    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';

    upcomingDays.forEach(day => {
      const entries = forecastsByDay[day];
      let min = Infinity, max = -Infinity;
      let bestIcon = '01d';
      let bestDesc = '';
      let minTimeDiff = Infinity;

      entries.forEach(e => {
        const entryDate = new Date(e.dt * 1000);
        const hour = entryDate.getHours();
        const diff = Math.abs(hour - 12);
        if (diff < minTimeDiff && e.weather && e.weather[0]) {
          bestIcon = e.weather[0].icon;
          bestDesc = e.weather[0].description;
          minTimeDiff = diff;
        }
        if (e.main.temp_min < min) min = e.main.temp_min;
        if (e.main.temp_max > max) max = e.main.temp_max;
      });

      const dayDiv = document.createElement('div');
      dayDiv.className = 'forecast-day';
      dayDiv.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${bestIcon}@2x.png" alt="forecast" />
        <div class="forecast-desc">${bestDesc}</div>
        <div class="forecast-range">${Math.round(max)}° / ${Math.round(min)}°</div>
      `;
      forecastContainer.appendChild(dayDiv);
    });
  } catch (err) {
    console.error('Forecast fetch error:', err);
  }
}

// --- Moon phase ---
async function fetchMoonPhase() {
  const url = `https://api.ipgeolocation.io/astronomy?apiKey=${GEO_API_KEY}&location=Minneapolis`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const rawPhase = data.moon_phase || "New Moon";
    const formattedPhase = rawPhase
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    const emoji = emojiMap[formattedPhase] || "🌑";

    document.getElementById('moon-emoji').textContent = emoji;
    document.getElementById('moon-phase-name').textContent = formattedPhase;
  } catch (err) {
    console.error('Moon phase fetch error:', err);
  }
}

// --- Kick everything off and set intervals ---
updateTimeAndDate();
fetchCurrentWeather();
fetchForecast();
fetchMoonPhase();

setInterval(updateTimeAndDate, 1000);
setInterval(() => {
  fetchCurrentWeather();
  fetchForecast();
  fetchMoonPhase();
}, 10 * 60 * 1000);
