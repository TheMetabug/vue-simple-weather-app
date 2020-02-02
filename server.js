var express = require('express')
var https = require('https')
var url = require('url')
var rp = require('request-promise')
var fs = require('fs')
const port = 8080
const app = express()

/**
 * Static file initialisations
 */
app.use(express.static('static'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'))
app.use('/vue', express.static(__dirname + '/node_modules/vue/dist/'))
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'))

/**
 * Create JSON object what frontend uses and also save JSON to a file
 */
let createJSON = (jsonData) => {
    let jsonFile = ""

    // Create obj with data of city weathers
    let saveTime = new Date().setMinutes(0, 1, 0)
    let obj = {
        lastUpdate: saveTime,
        citylist: []
    }
    // Push all cities apidata to obj's list
    jsonData.forEach(cityData => {
        obj.citylist.push(cityData)
    })

    // Convert to JSON and save that JSON to a file
    jsonFile = JSON.stringify(obj)
    fs.writeFileSync('data/weatherData.json', jsonFile, 'utf8', (err) => {
        if (err) throw err;
        console.log("File has been saved!")
    })
    return obj
}

let sendApiRequest = (res, optionsJson) => {
    try {
        // Fetch api json and save/send the json
        getDataFromApi(optionsJson, (apiData) => {
            let newJson = createJSON(apiData) 
            res.json(newJson)
        })
    } catch (err) {
        console.log(err)
    }
}

/**
 * Function to send GET requests to OpenWeatherMap
 */
let getDataFromApi = (optionsJson, callback) => {
    let listOfWeatherData = []
    let apiUrlList = []

    // Generate request uris to list
    optionsJson.cityCodes.forEach(cityCode => {
        apiUrlList.push(getDataUri(optionsJson, cityCode))
    })

    // Use map() to perform a request for all the request uris in a list
    Promise.all(apiUrlList.map(url =>
        rp({
            uri: url,
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true
        })
        .then(checkStatus)
        .catch((err) => { console.log(err) })
    ))
    .then(data => {
        data.forEach(apijsondata => {
            listOfWeatherData.push(apijsondata)
        })
        callback(listOfWeatherData)
    })
}

/**
 * Helper function for check status from response and handle promise resolve and reject
 */
let checkStatus = (response) => {
    if (response.cod == '200') {
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error(response.message));
    }
}

/**
 * Helper function for getting uri for single city's API call from OpenWeatherMap
 */
var getDataUri = (weatherOptions, cityId) => {
    let jsonData = ""
    return url.parse(url.format({
        protocol: 'http',
        hostname: weatherOptions.appHost,
        pathname: weatherOptions.appPath,
        query: {
            id: cityId,
            lang:  'fi',
            units: 'metric',
            appid: weatherOptions.apiKey
        }
    }))
}

/**
 * Helper function for checking is timeB in after (TimeA - hours)
 */
var isTimeToReload = (timeA, timeB, hours = 1) => {
    let dtA = new Date(timeA).getTime()
    let dtB = new Date(timeB).getTime()

    let isTime = ((dtA -dtB) >= (hours * 3600 * 1000))
    return isTime
}

/**
 * GET request for main page
 */
app.get('/', (req, res) => {
    res.render('index.html')
})

/**
 * GET request for fetching the JSON data to display
 */
app.get('/weatherdata', (req, res) => {
    if (!fs.existsSync('data/weatherOptions.json')) {
        throw new Error("weatherOptions.json not found!")
    }

    let optionsFile = fs.readFileSync('data/weatherOptions.json');
    let optionsJson =  JSON.parse(optionsFile)

    // If file does not exist, go to directly to api request
    if (!fs.existsSync('data/weatherData.json')) {
        console.log("File 'data/weatherData.json' not found, create a new one.")
        sendApiRequest(res, optionsJson)
    } else {   
        let jsonFile =  fs.readFileSync('data/weatherData.json')
        let currentJsonData =  JSON.parse(jsonFile)
    
        let curTime = new Date()
        let dataTime  = new Date(currentJsonData.lastUpdate)

        // API updates the data every 3 hours but we can check hourly just in case
        if (isTimeToReload(curTime, dataTime, 1)) {
            sendApiRequest(res, optionsJson)
        // If data is fresh, just give the old JSON data again
        } else {
            res.json(currentJsonData)  
        }
    }
})

/**
 * Listen command
 */
app.listen(port, () => console.log('Application listening on port: ' + port))