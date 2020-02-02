let doc = $(document).ready(function() {
    /**
     * Variables used globally in this script 
     */

    // Weather icon url information
    let weatherIconUrl      = 'http://openweathermap.org/img/wn/'
    let weatherIconFilename = '@2x.png'

    /**
     * Vue App object
     */ 
    let app = new Vue({
        el: '#app',
        data: {
            message:        'Hello',
            searchDisabled: false,
            // weatherData:    tempWeatherObject,
            cityList:       [],
            timer: ''
        },
        created () {
            this.timer = setInterval(this.fetchWeatherData(), 10000)
        },
        methods: {
            fetchWeatherData () {
                let parameters = { city: "All-cities" }
                let self = this
                $.ajax({
                    url: '/weatherdata',
                    data: parameters,
                    beforeSend: (xhr) => {
                        self.searchDisabled = true
                    },
                    success: (result, xhr, status) => {
                        self.parseWeatherData(result)
                    },
                    error: (xhr, status, error) => {
                        console.log(status);
                        console.log(error);
                    },
                    complete: (xhr, status) => {
                        self.searchDisabled = false
                    }
                })
            },
            parseWeatherData (jsonData) {
                let self = this
                let cityWeatherList = []
                if (Object.keys(jsonData.citylist).length >= 1) {
                    jsonData.citylist.forEach(cityData => {
                        cityWeatherList.push(self.createCityObject(cityData))
                    })
                }
                this.cityList = cityWeatherList;
            },
            createCityObject (cityData) {
                let self = this
                let curTime = new Date()

                cityObj = {}
                cityObj.cityname = cityData.city.name
                cityObj.currentWeather = false
                cityObj.forecasts = []

                cityData.list.forEach(forecast => {
                    let forecastTime = new Date(forecast.dt_txt.replace(/-/g,"/"))
                    // Get nearest forecast weather for current time
                    if (cityObj.currentWeather == false) {
                        if (self.isTimeABeforeB(curTime, forecastTime, 3)) {
                            cityObj.currentWeather = self.createForecastObject(forecast, forecastTime)
                        }
                    } else {
                        // Add 5 more forecast data to list before quitting this for loop
                        if (cityObj.forecasts.length < 5) {
                            cityObj.forecasts.push(self.createForecastObject(forecast, forecastTime))
                        }
                    }
                })
                return cityObj
            },
            createForecastObject (forecastData, forecastTime) {
                let clockTime =     new Date(forecastTime).toLocaleTimeString('fi',  { hour: "numeric", minute: "numeric"})
                let monthTime =     new Date(forecastTime).toLocaleString('fi',      { month: "short" })
                let dateTime =      new Date(forecastTime).toLocaleString('fi',      { day: "numeric" })
                let singleForecast = {
                    description:    forecastData.weather[0].description,
                    dateTime:       forecastTime,
                    clock:          clockTime,
                    month:          monthTime,
                    day:            dateTime.toString(),
                    icon:           weatherIconUrl + forecastData.weather[0].icon + weatherIconFilename,
                    temp:           Math.trunc(forecastData.main.temp),
                    humidity:       forecastData.main.humidity,
                    windspeed:      forecastData.wind.speed,
                    precipitation:  this.readPrecipitation(forecastData)
                }
                return singleForecast
            },
            readPrecipitation(forecastData) {
                // API data has snow/rain property ONLY if there is rain/snow happening
                if (forecastData.hasOwnProperty('rain')) {
                    return forecastData.rain["3h"]
                } else if (forecastData.hasOwnProperty('snow')) {
                    return forecastData.snow["3h"]
                }
            },
            isTimeABeforeB: (timeA, timeB, hours = 1) => {
                const dtA = new Date(timeA).getTime()
                const dtB = new Date(timeB).getTime()

                const timeStamp = Math.round(dtA / 1000)
                const timeStampHoursAgo = timeStamp - (hours * 3600)
                const dtAMinushours = new Date(timeStampHoursAgo*1000).getTime()

                const isBetween = (dtA > dtB) && (dtB > dtAMinushours)
                return isBetween
            },
        },
        beforeDestroy () {
          clearInterval(this.timer)
        }
    });
    
    // Placeholder weather data if something goes wrong
    let tempWeatherObject = [{
        cityname: "City name",
        currentWeather: {
            description: "description",
            dateTime: new Date(),
            clock: "00:00",
            month: "May",
            day: "2nd",
            icon: weatherIconUrl + "10d" + weatherIconFilename,
            temp: 0,
            humidity: 0,
            windspeed: 0,
            precipitation: 40
        },
        forecasts: [{
            description: "description",
            dateTime: new Date(),
            clock: "00:00",
            month: "May",
            day: "2nd",
            icon: weatherIconUrl + "10d" + weatherIconFilename,
            temp: 0,
            humidity: 0,
            windspeed: 0,
            precipitation: 40
        }],
    }]
});
