const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const cityInput = document.querySelector(".city-input");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const API_KEY = "d985467b2bd2884a1fbbf9fc490bf99e";

const formatDate = (dateString) =>{
    const date = new Date(dateString);
    
    const day = String(date.getDate()).padStart(2, '0'); 
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear(); 
    
    return `${day}-${month}-${year}`;
}

const createWeatherCard = (cityName, weatherItem, index) =>{

    const dateString = weatherItem.dt_txt.split(" ")[0];
    const formattedDate = formatDate(dateString);

    //console.log(weatherItem);

    if(index === 0){
        return `<div class="details">
                    <h2>${cityName} (${formattedDate})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp -273.15).toFixed(2)}°C</h4>
                    <h4>Feels Like: ${(weatherItem.main.feels_like -273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} m/s</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                    <h4>Temp Max/Min: ${(weatherItem.main.temp_max -273.15).toFixed(2)}°C / ${(weatherItem.main.temp_min -273.15).toFixed(2)}°C</h4>
                </div>
                <div class="icon">
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    }
    else{
        return `<li class="card">
                    <h3>${formattedDate}</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                    <h4>Temperature: ${(weatherItem.main.temp -273.15).toFixed(2)}°C</h4>
                    <h4>Feels Like: ${(weatherItem.main.feels_like -273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} m/s</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                    <h4>Temp Max/Min: ${(weatherItem.main.temp_max -273.15).toFixed(2)}°C / ${(weatherItem.main.temp_min -273.15).toFixed(2)}°C</h4>
                </li>`;
    }
}

const getWeatherDetails = (cityName, lat, lon) =>{
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data =>{

        const uniqueForecastDays =[];
        const fiveDaysForecast = data.list.filter(forecast =>{
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate);
            }
        });

        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        fiveDaysForecast.forEach((weatherItem, index)=> {
            if(index === 0){
                currentWeatherDiv.insertAdjacentHTML("beforeend",createWeatherCard(cityName, weatherItem, index));
            }
            else{
                weatherCardsDiv.insertAdjacentHTML("beforeend",createWeatherCard(cityName, weatherItem, index));
            } 
        });
    }).catch(() =>{
        alert("An error occured while fetching the weather forecast!");
    });
}

const getCityCoordinates = () =>{
    const cityName = cityInput.value.trim();
    if(!cityName) return;
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL).then(res => res.json()).then(data =>{
        if(!data.length) return alert(`No coordinates found for ${cityName}`);
        const {name, lat, lon} = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() =>{
        alert("An error occured while fetching the coordinates!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const {latitude, longitude} = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data =>{
                const {name} = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() =>{
                alert("An error occured while fetching the city!");
            });
        },
        error =>{
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            }
        }
    );
}
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());