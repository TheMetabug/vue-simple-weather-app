let doc = $(document).ready(function() {
    /**
     * Vue App object
     */ 
    let app = new Vue({
        el: '#app',
        data: {
            cityList: [],
            timer: '',
            selectedCity: undefined,
            selectOptions: undefined
        },
        computed: {
            /**
             * Get currently selected city from select element. Returns whole when "All" option is selected.
             */
            filteredCityList () {
                if (this.selectOptions != undefined) {
                    let filteredCity = this.cityList.filter(city => city.cityname.indexOf(this.selectedCity) > -1)
                    if (filteredCity.length < 1) {
                        return this.cityList
                    }
                    return filteredCity
                }
            }
        },
        created () {
            // Create method to automatically refresh to get newest forecast data
            this.timer = setInterval(this.fetchWeatherData(), this.nextRefreshTime())
        },
        methods: {
            /**
             * Send GET AJAX request to server to get data from JSON file
             */
            fetchWeatherData () {
                let self = this
                $.ajax({
                    url: '/weatherdata',
                    success: (result, xhr, status) => {
                        self.parseWeatherData(result)
                    },
                    error: (xhr, status, error) => {
                        console.log(status);
                        console.log(error);
                    },
                })
            },
            /**
             * Parse weather information from given JSON data from server
             */
            parseWeatherData (jsonData) {
                let self = this
                let cityWeatherList = []
                if (Object.keys(jsonData.citylist).length >= 1) {
                    jsonData.citylist.forEach(cityData => {
                        cityWeatherList.push(self.createCityObject(cityData))
                    })
                }
                if (this.selectedCity == undefined) {
                    let cityNameList = []
                    let cityOptionList = []
                    cityWeatherList.forEach(cityData  => {
                        let cityName = cityData.cityname
                        cityNameList.push(cityName)
                        cityOptionList.push({
                            text: cityName,
                            value: cityName,
                        })
                    })
                    cityOptionList.push({
                        text: 'Kaikki',
                        value: cityNameList.toString(),
                    })
                    this.selectedCity = cityNameList.toString()
                    this.selectOptions = cityOptionList
                }
                this.cityList = cityWeatherList;
            },
            /**
             * Helper function to create single city object
             */
            createCityObject (cityData) {
                let self = this

                cityObj = {}
                cityObj.cityname = cityData.city.name
                cityObj.currentWeather = false
                cityObj.forecasts = []

                cityData.list.forEach(forecast => {
                    const forecastTime = new Date(forecast.dt_txt.replace(/-/g,"/"))
                    // Get nearest forecast weather for current time
                    if (cityObj.currentWeather == false) {
                        cityObj.currentWeather = self.createForecastObject(forecast, forecastTime)
                    } else {
                        // Add 5 more forecast data to list before quitting this for loop
                        if (cityObj.forecasts.length < 5) {
                            cityObj.forecasts.push(self.createForecastObject(forecast, forecastTime))
                        }
                    }
                })
                return cityObj
            },
            /**
             * Helper function to create single forecast object
             */
            createForecastObject (forecastData, forecastTime) {
                const weatherIconUrl      = 'http://openweathermap.org/img/wn/'
                const weatherIconFilename = '@2x.png'
                const clockTime =     new Date(forecastTime).toLocaleTimeString('fi',  { hour: "numeric", minute: "numeric"})
                const monthTime =     new Date(forecastTime).toLocaleString('fi',      { month: "short" })
                const dateTime =      new Date(forecastTime).toLocaleString('fi',      { day: "numeric" })
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
            /**
             * Helper function to get precipitation
             * API data has snow/rain property ONLY if there is rain/snow happening
             * so we need to do safetycheck if data containst it or not.
             */
            readPrecipitation(forecastData) {
                if (forecastData.hasOwnProperty('rain')) {
                    return forecastData.rain["3h"]
                } else if (forecastData.hasOwnProperty('snow')) {
                    return forecastData.snow["3h"]
                }
            },
            /**
             * Helper function to calculate next refresh time in ms
             * This helps page to refresh every hour
             */
            nextRefreshTime: () => {
                const curTime = new Date().getTime()
                const timeStamp = Math.round(curTime / 1000)
                const timeStampHoursAgo = timeStamp + (3600)

                // Get next hour with minute value to set 0
                // and set minutes with extra second to let API have time to refresh on their end
                const nextHour = new Date(timeStampHoursAgo*1000).setMinutes(0,1,0) 
                return nextHour - curTime
            },
        },
        beforeDestroy () {
          clearInterval(this.timer)
        }
    });

});
