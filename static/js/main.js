let doc = $(document).ready(function() {
    /**
     * Variables used globally in this script 
     */

    // Weather icon url information
    let weatherIconUrl      = 'http://openweathermap.org/img/wn/'
    let weatherIconFilename = '@2x.png'

    // Dummy weather data (placeholder if something goes wrong)
    let tempWeatherObject = {
        cityname: "City name",
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
        }]
    }

    /**
     * Vue App object
     */ 
    let app = new Vue({
        el: '#app',
        data: {
            message:        'Hello',
            searchDisabled: false,
            weatherData:    tempWeatherObject,
            forecastList:   [],
            timer: ''
        },
        created () {
            this.fetchWeatherData()
            this.timer = setInterval(this.fetchWeatherData(), 10000)
        },
        computed: {
            currentWeather () {
                self = this
                data = this.weatherData
                if (data != undefined) {
                    let curTime = new Date()
                    // let curClock = curTime.toLocaleTimeString('en-GB', { hour: "numeric"}) + ":00"
                    let foundCurrentWeather = false
                    let forecastList = []
                    data.forecasts.forEach(forecast => {
                        // Get nearest forecast weather for current time
                        if (foundCurrentWeather == false) {
                            if (self.isTimeABeforeB(curTime, forecast.dateTime, 3)) {
                                forecastList.push(self.createForecastObject(data, forecast))
                                foundCurrentWeather = true
                            }
                        } else {
                            // Add 5 more forecast data to list before quitting this for loop
                            if (forecastList.length < 5) {
                                forecastList.push(self.createForecastObject(data, forecast))
                            }
                        }
                    })
                    this.forecastList = forecastList
                    return forecastList[0]
                }
                return tempWeatherObject
            },
            currentForecastList () {
                return this.forecastList
            }
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
                let countryWeathers = []
                if (Object.keys(jsonData.countries).length >= 1) {
                    jsonData.countries.forEach(country => {
                        let singleWeather = {
                            cityname: country.city.name,
                            forecasts: []
                        }
                        country.list.forEach(forecast => {
                            let foreCastTime =  new Date(forecast.dt_txt.replace(/-/g,"/"))
                            let clockTime =     new Date(foreCastTime).toLocaleTimeString('en-GB',  { hour: "numeric", minute: "numeric"})
                            let monthTime =     new Date(foreCastTime).toLocaleString('en-GB',      { month: "short" })
                            let dateTime =      new Date(foreCastTime).toLocaleString('en-GB',      { day: "numeric" })
                            let singleForecast = {
                                description:    forecast.weather[0].description,
                                dateTime:       foreCastTime,
                                clock:          clockTime,
                                month:          monthTime,
                                day:            dateTime.toString() + self.nth(dateTime),
                                icon:           weatherIconUrl + forecast.weather[0].icon + weatherIconFilename,
                                temp:           Math.trunc(forecast.main.temp - 273.15),
                                humidity:       forecast.main.humidity,
                                windspeed:      forecast.wind.speed,
                                precipitation: (forecast.hasOwnProperty('rain')) ? forecast.rain["3h"] : ""
                            }
                            singleWeather.forecasts.push(singleForecast)
                        })
                        countryWeathers.push(singleWeather)
                    })
                }
                // console.log(countryWeathers[0])
                this.weatherData = countryWeathers[0];
            },
            isTimeABeforeB: (timeA, timeB, hours = 1) => {
                // one hour in milliseconds
                let dtA = new Date(timeA).getTime()
                let dtB = new Date(timeB).getTime()

                let timeStamp = Math.round(dtA / 1000)
                let timeStampHoursAgo = timeStamp - (hours * 3600)
                let dtAMinushours = new Date(timeStampHoursAgo*1000).getTime()

                let isBetween = (dtA > dtB) && (dtB > dtAMinushours)
                return isBetween

            },
            createForecastObject (data, forecastData) {
                result = {
                    cityname:       data.cityname,
                    description:    forecastData.description,
                    clock:          forecastData.clock,
                    month:          forecastData.month,
                    day:            forecastData.day,
                    icon:           forecastData.icon,
                    temp:           forecastData.temp,
                    humidity:       forecastData.humidity,
                    windspeed:      forecastData.windspeed,
                    precipitation:  forecastData.precipitation
                }
                return result
            },
            nth: (d) => {
                if (d > 3 && d < 21) return 'th'
                switch (d % 10) {
                    case 1:  return "st"
                    case 2:  return "nd"
                    case 3:  return "rd"
                    default: return "th"
                }
            }
        },
        beforeDestroy () {
          clearInterval(this.timer)
        }
    });
});
