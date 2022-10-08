const date = document.querySelector(".header__info--date");
const time = document.querySelector(".header__info--time");

const main = document.querySelector(".main");

const inputValue = document.querySelector(".form__input");
const submitBtn = document.querySelector(".form__btn");
const loc = document.querySelector(".weatherForcast__location");

const select = document.querySelector(".weatherForcast__select");

const weatherForcast = document.querySelector(".weatherForcast");

const weatherForcastToday = document.querySelector(".weatherForcast__today");

const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Get and display the date and time every second
setInterval(() => {
  const todayDate = new Date();
  const todaysDate = todayDate.getDate();
  const day = todayDate.getDay();
  const weekDay = weekDays[day];
  const month = months[todayDate.getMonth()];
  const year = todayDate.getFullYear();

  const hours = todayDate.getHours();
  const mins = todayDate.getMinutes().toString().padStart(2, 0);
  const secs = todayDate.getSeconds().toString().padStart(2, 0);

  date.innerHTML = `${weekDay}, ${month} ${todaysDate} ${year}`;
  time.innerHTML = `${hours}:${mins}:${secs}`;
}, 1000);

// A helper function that fetches and returns data from an api
const getData = async (url) => {
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    console.log(err);
  }
};

// A function that takes a city and returns the coordinates of that city (longitude and latitude)
const geoCoding = (cityName) => {
  const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=21180e3c269cd65dd2bd54cb763ed0ff`;
  return getData(geocodingUrl);
};

// A function that takes the longitude and latitude and returns the city at that location
const reverseGeoCoding = (lat, lon) => {
  const geocodingUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=21180e3c269cd65dd2bd54cb763ed0ff`;
  return getData(geocodingUrl);
};

// A function that takes the corrdinates of a city and returns the city's weather forcast for the next 5 days
// at different times of the day
const weatherFromLocation = (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=21180e3c269cd65dd2bd54cb763ed0ff`;
  return getData(url);
};

// A function that takes the corrdinates of a city and returns the current day's weather
const todayWeather = (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=21180e3c269cd65dd2bd54cb763ed0ff`;
  return getData(url);
};

//  A function that takes the time of day from a select element in the DOM and returns the corresponding time
const getTime = (timeOfDay) => {
  let time;
  if (timeOfDay === "midnight") time = "00:00:00";
  if (timeOfDay === "before dawn") time = "03:00:00";
  if (timeOfDay === "dawn") time = "06:00:00";
  if (timeOfDay === "morning") time = "09:00:00";
  if (timeOfDay === "noon") time = "12:00:00";
  if (timeOfDay === "evening") time = "18:00:00";
  if (timeOfDay === "night") time = "21:00:00";

  return time;
};

// A function that takes the time and returns either "day" or "night"
const getDayTime = (time) => {
  let dayTime;
  if (time === "00:00:00" || time === "03:00:00" || time === "21:00:00") {
    dayTime = "night";
  } else {
    dayTime = "day";
  }

  return dayTime;
};

// A function that takes the weather data from the 5 days forcast api as well as the time and
// returns an array of weather data for the next 5 days at the specified time
// If today's weather (at the specified time) is included in the api we append it to the list of data.
const dataToDisplay = (weatherData, time) => {
  let todaysWeather;
  let allDaysWeather;
  if (weatherData.list) {
    todaysWeather = weatherData.list[0];
    const otherDaysWeather = weatherData.list.filter((el) =>
      el.dt_txt.includes(time)
    );
    if (
      todaysWeather.dt_txt.includes(time) &&
      !otherDaysWeather.includes(todaysWeather)
    ) {
      allDaysWeather = [todaysWeather, ...otherDaysWeather];
    } else {
      allDaysWeather = otherDaysWeather;
    }
  }

  return allDaysWeather;
};

// A function that takes the weather description and returns the right icon to display
const getIcon = (main, desc, dayTime) => {
  switch (main) {
    case "Thunderstorm":
      if (dayTime === "night") {
        return "11n";
      } else return "11d";
    case "Drizzle":
      if (dayTime === "night") {
        return "09n";
      } else return "09d";
    case "Rain":
      if (desc === "freezing rain") {
        return "13d";
      } else if (
        desc === "ligh intensity shower rain" ||
        "shower rain" ||
        "heavy intensity shower rain" ||
        "ragged shower rain"
      ) {
        return "09d";
      } else {
        if (dayTime === "night") {
          return "10n";
        } else return "10d";
      }
    case "Snow":
      if (dayTime === "night") {
        return "13n";
      } else return "13d";
    case "Mist" ||
      "Smoke" ||
      "Haze" ||
      "Dust" ||
      "Fog" ||
      "Sand" ||
      "Ash" ||
      "Squal" ||
      "Tornado":
      if (dayTime === "night") {
        return "50n";
      } else return "50d";
    case "Clear":
      if (dayTime === "night") {
        return "01n";
      } else return "01d";
    case "Clouds":
      if (desc === "few clouds") {
        if (dayTime === "night") {
          return "02n";
        } else return "02d";
      } else if (desc === "scattered clouds") {
        return "03d";
      } else {
        return "04d";
      }

    default:
      return "";
  }
};

// A function to get the map from leaflet
const getMap = (lat, lon) => {
  // This portion of code is to see if the map already exists so we can remove it before we update the map with another location
  const container = L.DomUtil.get("map");
  if (container != null) {
    container._leaflet_id = null;
  }

  const map = L.map("map").setView([lat, lon], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.marker([lat, lon]).addTo(map).openPopup();

  return map;
};

const renderSpinner = (element) => {
  const spinner = `
    <div class="spinner">
      <svg>
        <use href="assets/loader-icon.svg#icon-loader"></use>
      </svg>
    </div>
  `;
  element.innerHTML = "";
  element.insertAdjacentHTML("afterbegin", spinner);
};

// This function takes the city and time of day and displays the data and the map in the UI
async function forcast(city = "algiers", timeOfDay = "morning") {
  renderSpinner(weatherForcastToday);

  const data = await geoCoding(city);

  loc.innerHTML = `${data[0].name}, ${data[0].country}`;
  const lat = data[0].lat;
  const lon = data[0].lon;

  const weatherData = await weatherFromLocation(lat, lon);

  const time = getTime(timeOfDay);

  const dayTime = getDayTime(time);

  const allDaysWeather = dataToDisplay(weatherData, time);

  const today = weekDays[new Date().getDay()];
  const tomorrow = weekDays[new Date().getDay() + 1];

  const todaysWeather = await todayWeather(lat, lon);

  const todayCard = `
            <h1 class="weatherForcast__title">Today</h1>
            <div class="weatherForcast__today--desc">${
              todaysWeather.weather[0].description
            }</div>
            <img class="weatherForcast__today--icon" src="/assets/${getIcon(
              todaysWeather.weather[0].main,
              todaysWeather.weather[0].description,
              "day"
            )}@2x.png" alt="weather icon" />
            <div class="weatherForcast__today--infoContainer">
                <div class="weatherForcast__today--temp">
                ${Math.round(todaysWeather.main.temp - 273)}<sup>°C</sup>
                </div>
                <div class="weatherForcast__today--windHumidity">
                    <div class="weatherForcast__today--wind">humidity: <span>${
                      todaysWeather.main.humidity
                    }%</span></div>
                    <div class="weatherForcast__today--wind">wind speed: <span>${todaysWeather.wind.speed.toFixed(
                      1
                    )}km/h</span></div>
                    <div class="weatherForcast__today--wind">Pressure: <span>${
                      todaysWeather.main.pressure
                    } mbar</span></div>
                </div>
            </div>
    `;

  const list = allDaysWeather
    .map((dayWeather) => {
      const weekDay = weekDays[new Date(dayWeather.dt_txt).getDay()];
      const temp = Math.round(dayWeather.main.temp - 273);
      const main = dayWeather.weather[0].main;
      const desc = dayWeather.weather[0].description;
      const windSpeed = Math.round(dayWeather.wind.speed);
      const humidity = dayWeather.main.humidity;

      const card = `
    <article class="weatherCard">
          <p class="weatherCard__day">${
            weekDay === today
              ? "Today"
              : weekDay === tomorrow
              ? "Tomorrow"
              : weekDay
          }</p>
          <div class="weatherCard__desc">${desc}</div>
          <img class="weatherCard__icon" src="/assets/${getIcon(
            main,
            desc,
            dayTime
          )}@2x.png" alt="weather icon" />
          <div class="weatherCard__temp">
          ${temp}<sup>°C</sup>
          </div>
          <div class="weatherCard__wind">humidity: <span>${humidity}%</span></div>
          <div class="weatherCard__wind">wind speed: <span>${windSpeed} km/h</span></div>
    </article>
  `;
      return card;
    })
    .join(" ");

  weatherForcast.innerHTML = list;
  weatherForcastToday.innerHTML = "";
  weatherForcastToday.insertAdjacentHTML("beforeend", todayCard);

  getMap(lat, lon);
}

// Get and display the user's location weather information on the webpage when it loads
window.addEventListener("load", async function () {
  navigator.geolocation.getCurrentPosition(async function (position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    const [{ name }] = await reverseGeoCoding(lat, lon);
    console.log(name);
    forcast(name);
  });
  // forcast("algiers");
});

// When a new location is chosen update the UI with that location
submitBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  forcast(inputValue.value);
});

// Update the UI when a new time of day is chosen, otherwise always display morning data
select.addEventListener("change", async function (e) {
  selectValue = e.target.value === "select" ? "morning" : e.target.value;
  navigator.geolocation.getCurrentPosition(async function (position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    const [{ name }] = await reverseGeoCoding(lat, lon);
    console.log(name);
    forcast(inputValue.value || name, selectValue);
  });
  // forcast(inputValue.value || "algiers", selectValue);
});