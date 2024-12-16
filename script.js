const apiKey = 'd01ee0b4cd6cdf2005ec22a618389572';
const weatherDataDiv = document.getElementById('weather-data');
const forecastDataDiv = document.getElementById('forecast-data');
const searchBtn = document.getElementById('search-btn');
const locateBtn = document.getElementById('locate-btn');
const searchInput = document.getElementById('search');
const currentTimeEl = document.getElementById('current-time');

function updateTime() {
    const now = new Date();
    currentTimeEl.innerText = now.toLocaleString();
    setTimeout(updateTime, 1000);
}

function setBackground(description) {
    if (description.includes('rain')) document.body.style.background = 'url("pictures/pexels-hikaique-125510.jpg")';
    else if (description.includes('clear')) document.body.style.background = 'url("pictures/pexels-lastly-1576955.jpg")';
    else if (description.includes('cloud')) document.body.style.background = 'url("pictures/pexels-angel-dm-3611931-5402181.jpg")';
    else if (description.includes('snow')) document.body.style.background = 'url("pictures/pexels-kristingroth2-54200.jpg")';
    document.body.style.backgroundSize = 'cover';
}

function displayWeather(data) {
    const { temp, humidity } = data.main;
    const { description, icon } = data.weather[0];
    weatherDataDiv.innerHTML = `
        <h3>${data.name}</h3>
        <p>${description.toUpperCase()}</p>
        <p>Temperature: ${temp}°C</p>
        <p>Humidity: ${humidity}%</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
    `;
    setBackground(description);
}

function displayForecast(data) {
    forecastDataDiv.innerHTML = data.list
        .filter((_, index) => index % 8 === 0)
        .map(item => {
            const date = new Date(item.dt_txt);
            return `
                <div class="forecast-item">
                    <p>${date.toDateString()}</p>
                    <p>Temp: ${item.main.temp}°C</p>
                    <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}">
                </div>
            `;
        })
        .join('');
}

async function fetchWeather(city) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
        if (!res.ok) throw new Error('Weather data not available');
        const data = await res.json();
        displayWeather(data);
    } catch (error) {
        weatherDataDiv.innerHTML = `<p>${error.message}</p>`;
    }
}

async function fetchForecast(city) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
        if (!res.ok) throw new Error('Forecast data not available');
        const data = await res.json();
        displayForecast(data);
    } catch (error) {
        forecastDataDiv.innerHTML = `<p>${error.message}</p>`;
    }
}

function searchWeather() {
    const city = searchInput.value.trim();
    if (city) {
        fetchWeather(city);
        fetchForecast(city);
    }
}

function locateWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            try {
                const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`);
                if (!res.ok) throw new Error('Location weather data not available');
                const data = await res.json();
                displayWeather(data);
                fetchForecast(data.name);
            } catch (error) {
                weatherDataDiv.innerHTML = `<p>${error.message}</p>`;
            }
        });
    } else {
        weatherDataDiv.innerHTML = '<p>Geolocation not supported by this browser.</p>';
    }
}

searchBtn.addEventListener('click', searchWeather);
locateBtn.addEventListener('click', locateWeather);
updateTime();
