var doc = $(document).ready(function() {
    // Weather icon url information
    var weatherIconUrl      = 'http://openweathermap.org/img/wn/'
    var weatherIconFilename = '@2x.png'

    // Test weather data (placeholder)
    var tempWeatherObject = {
        cityname: "City name",
        forecasts: [{
            description: "description",
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

    // Vue App
    var app = new Vue({
        el: '#app',
        data: {
            message:        'Hello',
            searchDisabled: false,
            weatherData:    tempWeatherObject,
            timer: ''
        },
        created () {
            this.fetchWeatherData()
            this.timer = setInterval(this.fetchWeatherData(), 10000)
        },
        computed: {
            currentWeather: function() {
                data = this.weatherData
                if (data != undefined) {
                    console.log(data)
                    var curTime = new Date()
                    var curClock = curTime.toLocaleTimeString('en-GB', { hour: "numeric"}) + ":00"
                    var result = false
                    data.forecasts.forEach(forecast => {
                        if (curClock == forecast.clock && result == false) {
                            result = {
                                cityname:       data.cityname,
                                description:    forecast.description,
                                clock:          forecast.clock,
                                month:          forecast.month,
                                day:            forecast.day,
                                icon:           forecast.icon,
                                temp:           forecast.temp,
                                humidity:       forecast.humidity,
                                windspeed:      forecast.windspeed,
                                precipitation:  forecast.precipitation
                            }
                        }
                    })
                    return result
                }
                return tempWeatherObject
            }
        },
        methods: {
            fetchWeatherData: function() {
                var parameters = { city: "All-cities" }
                var self = this
                $.ajax({
                    url: '/weatherdata',
                    data: parameters,
                    beforeSend: function(xhr) {
                        this.searchDisabled = true
                    },
                    success: function(result, xhr, status) {
                        self.parseWeatherData(result)
                    },
                    error: function(xhr, status, error) {
                        console.log(status);
                        console.log(error);
                    },
                    complete: function(xhr, status) {
                        this.searchDisabled = false
                    }
                })
            },
            parseWeatherData: function(jsonData) {
                var self = this
                var countryWeathers = []
                if (Object.keys(jsonData.countries).length >= 1) {
                    jsonData.countries.forEach(country => {
                        var singleWeather = {
                            cityname: country.city.name,
                            forecasts: []
                        }
                        country.list.forEach(forecast => {
                            var foreCastTime =  new Date(forecast.dt_txt.replace(/-/g,"/"))
                            var clockTime =     new Date(foreCastTime).toLocaleTimeString('en-GB', { hour: "numeric", minute: "numeric"})
                            var monthTime =     new Date(foreCastTime).toLocaleString('en-GB', { month: "short" })
                            var dateTime =      new Date(foreCastTime).toLocaleString('en-GB', { day: "numeric" })
                            var singleForecast = {
                                description:    forecast.weather[0].description,
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
            nth: function(d) {
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
