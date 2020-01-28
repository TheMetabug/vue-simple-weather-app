var doc = $(document).ready(function() {
    // Weather icon url information
    var weatherIconUrl      = 'http://openweathermap.org/img/wn/'
    var weatherIconFilename = '@2x.png'

    // Test weather data (placeholder)
    var testWeather = {
        cityname: "Helsinki",
        description: "rainy sky",
        current: {
            dateTime: 1560350191,
            icon: "10d",
            temp: 12,
            humidity: 23,
            windspeed: 0.77
        },
    }

    // Vue App
    var app = new Vue({
        el: '#app',
        data: {
            message: 'Hello',
            searchDisabled: false,
            weatherData: testWeather,
            weatherIcon: weatherIconUrl + testWeather.current.icon + weatherIconFilename
        },
        methods: {
            printMessage: function() {
                console.log(this.message)
                var parameters = { city: "helsinki" }
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
                testWeather.cityname            = jsonData.name,
                testWeather.description         = jsonData.weather[0].description,
                testWeather.current.icon        = this.weatherIconUrl + jsonData.weather.icon,
                testWeather.current.temp        = jsonData.main.temp,
                testWeather.current.humidity    = jsonData.main.humidity,
                testWeather.current.windspeed   = jsonData.wind.speed
            }
        }
    });
});
