const apiKey = "66daf58f96a0953a1ea2fd4b2efbb549";

function getWeatherByCity() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Please enter a city name");

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  fetchWeather(url);
}

function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
      fetchWeather(url);
    }, () => {
      alert("Unable to access your location");
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function fetchWeather(url) {
  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error("Weather data not found");
      return response.json();
    })
    .then(data => {
      displayWeather(data);
      fetchForecast(data.name); // use city name to get forecast
    })
    .catch(error => {
      document.getElementById("weatherResult").innerHTML = `<p>${error.message}</p>`;
      document.getElementById("forecast").innerHTML = "";
    });
}

function displayWeather(data) {
  const { name, main, weather, wind } = data;
  const iconCode = weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  const result = `
    <h2>${name}</h2>
    <img src="${iconUrl}" alt="${weather[0].description}" />
    <p><strong>${weather[0].main}</strong> - ${weather[0].description}</p>
    <p>🌡️ Temperature: ${main.temp} °C</p>
    <p>💧 Humidity: ${main.humidity}%</p>
    <p>🍃 Wind: ${wind.speed} m/s</p>
  `;
  document.getElementById("weatherResult").innerHTML = result;
}

function fetchForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error("Forecast data not found");
      return response.json();
    })
    .then(data => displayForecast(data))
    .catch(error => {
      document.getElementById("forecast").innerHTML = `<p>${error.message}</p>`;
    });
}

function displayForecast(data) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "<h3>5-Day Forecast</h3>";

  const forecasts = {};
  data.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!forecasts[date] && item.dt_txt.includes("12:00:00")) {
      forecasts[date] = item;
    }
  });

  Object.values(forecasts).slice(0, 5).forEach(day => {
    const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
    const forecastHTML = `
      <div class="forecast-day">
        <strong>${new Date(day.dt_txt).toDateString()}</strong><br/>
        <img src="${iconUrl}" alt="${day.weather[0].description}" />
        ${day.weather[0].main} - ${day.main.temp}°C
      </div>
    `;
    forecastContainer.innerHTML += forecastHTML;
  });
}
