// Initial Migration Test - Phase 1.8
// Temporary implementation that includes existing app.js functionality
// This will be replaced with proper TypeScript modules in Phase 2

import './styles/main.css'

// eslint-disable-next-line no-console
console.log('Tablet Kiosk application initializing...')

// Temporary: Include the existing app.js functionality inline
// This ensures the build produces a working application while maintaining current functionality

// Load environment variables
const API_KEY =
  import.meta.env.VITE_OPENWEATHER_API_KEY || 'f749be486c7d4b8086fd36a881cee470'
const LAT = '44.91233400591799'
const LON = '-93.31721559338696'

// Include existing app.js functionality inline for Phase 1.8 testing
function updateTimeAndDate(): void {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const timeElement = document.getElementById('time')
  if (timeElement) {
    timeElement.textContent = `${hours}:${minutes}`
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }
  const dateElement = document.getElementById('date')
  if (dateElement) {
    dateElement.textContent = now.toLocaleDateString(undefined, options)
  }
}

function formatTimeFromUnix(unix: number): string {
  return new Date(unix * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function mapOWMIconToSVG(owmCode: string): string {
  const map: Record<string, string> = {
    '01d': 'clear-day',
    '01n': 'clear-night',
    '02d': 'partly-cloudy-day',
    '02n': 'partly-cloudy-night',
    '03d': 'partly-cloudy-day',
    '03n': 'partly-cloudy-night',
    '04d': 'overcast',
    '04n': 'overcast',
    '09d': 'rain',
    '09n': 'rain',
    '10d': 'rain',
    '10n': 'rain',
    '11d': 'thunderstorms-day',
    '11n': 'thunderstorms-night',
    '13d': 'snow',
    '13n': 'snow',
    '50d': 'mist',
    '50n': 'mist',
  }
  return map[owmCode] || 'na'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function updateSunMoonTimes(data: any): void {
  const sunriseElement = document.getElementById('sunrise-time')
  const sunsetElement = document.getElementById('sunset-time')
  const moonriseElement = document.getElementById('moonrise-time')
  const moonsetElement = document.getElementById('moonset-time')

  if (sunriseElement) {
    sunriseElement.textContent = formatTimeFromUnix(data.current.sunrise)
  }
  if (sunsetElement) {
    sunsetElement.textContent = formatTimeFromUnix(data.current.sunset)
  }
  if (moonriseElement) {
    moonriseElement.textContent =
      data.daily[0].moonrise === 0
        ? '-'
        : formatTimeFromUnix(data.daily[0].moonrise)
  }
  if (moonsetElement) {
    moonsetElement.textContent =
      data.daily[0].moonset === 0
        ? '-'
        : formatTimeFromUnix(data.daily[0].moonset)
  }
}

function getMoonPhaseName(phase: number): string {
  const phases = [
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full Moon',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent',
  ]
  const index = Math.floor(phase * 8) % 8
  return phases[index]
}

function updateMoonPhase(moonPhaseFloat: number): void {
  // Set name
  const name = getMoonPhaseName(moonPhaseFloat)
  const moonPhaseNameElement = document.getElementById('moon-phase-name')
  if (moonPhaseNameElement) {
    moonPhaseNameElement.textContent = name
  }

  // Clear old SVG
  const container = document.getElementById('moon')
  if (container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }

    // Render new SVG using library (phase_junk function from moon-phase.js)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (window as any).phase_junk === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).phase_junk(moonPhaseFloat)
    }
  }
}

async function fetchWeatherData(): Promise<void> {
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${LAT}&lon=${LON}&units=imperial&exclude=minutely,hourly,alerts&appid=${API_KEY}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    // Current conditions
    const current = data.current
    const iconCode = current.weather[0].icon
    const desc = current.weather[0].description
    const temp = Math.round(current.temp)
    const tempMin = Math.round(data.daily[0].temp.min)
    const tempMax = Math.round(data.daily[0].temp.max)

    const iconFile = mapOWMIconToSVG(iconCode)
    const weatherIcon = document.getElementById('weather-icon')
    const tempNow = document.getElementById('temp-now')
    const weatherDesc = document.getElementById('weather-desc')
    const weatherRange = document.getElementById('weather-range')

    if (weatherIcon) {
      ;(weatherIcon as HTMLObjectElement).data =
        `/weather-icons/${iconFile}.svg`
      weatherIcon.setAttribute('alt', desc)
    }
    if (tempNow) {
      tempNow.textContent = `${temp}°`
    }
    if (weatherDesc) {
      weatherDesc.textContent = desc
    }
    if (weatherRange) {
      weatherRange.textContent = `${tempMax}° / ${tempMin}°`
    }

    updateSunMoonTimes(data)

    // Moon phase
    const svg = document.getElementById('moon')
    updateMoonPhase(data.daily[0].moon_phase)
    if (svg) {
      svg.setAttribute('viewBox', '0 0 200 200')
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    }

    // Forecast (next 3 days, skip today)
    const forecastContainer = document.getElementById('forecast')
    if (forecastContainer) {
      forecastContainer.innerHTML = ''
      for (let i = 1; i <= 3; i++) {
        const day = data.daily[i]
        const fIcon = day.weather[0].icon
        const fDesc = day.weather[0].description
        const fMax = Math.round(day.temp.max)
        const fMin = Math.round(day.temp.min)

        const dateObj = new Date(day.dt * 1000)
        const dayName = dateObj.toLocaleDateString(undefined, {
          weekday: 'short',
        })

        const forecastIconFile = mapOWMIconToSVG(fIcon)
        const div = document.createElement('div')
        div.className = 'forecast-day'
        div.innerHTML = `
          <div class="forecast-day-name">${dayName}</div>
          <object type="image/svg+xml" data="/weather-icons/${forecastIconFile}.svg" class="forecast-icon"></object>
          <div class="forecast-desc">${fDesc}</div>
          <div class="forecast-range">${fMax}° / ${fMin}°</div>
        `
        forecastContainer.appendChild(div)
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('One Call API error:', err)
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line no-console
  console.log('DOM loaded, initializing tablet kiosk application...')

  // Start the application
  updateTimeAndDate()
  fetchWeatherData()

  // Set up intervals
  setInterval(updateTimeAndDate, 1000)
  setInterval(fetchWeatherData, 10 * 60 * 1000) // every 10 minutes
})
