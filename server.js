var express = require('express')
var nodeSchedule = require('node-schedule')
var fs = require('fs')
const port = 8080
const app = express()
/**
 * Function what fetches the data from OpenWeatherMap API and writes it to file.
 */
var fetchAndCreateJSON = function() {
    var obj = {
        table: []
    }
    obj.table.push({data: "asd"})
    var json = JSON.stringify(obj)
    fs.writeFile(__dirname + '/data/weatherDataDynamic.json', json, 'utf8', (err) => {
        if (err) throw err;
        console.log("File has been saved!")
    })
}

/**
 * Static file initialisations
 */
app.use(express.static('static'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'))
app.use('/vue', express.static(__dirname + '/node_modules/vue/dist/'))
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'))

/**
 * GET requests
 */
app.get('/', function(req, res) {
    res.render('index.html')
})
app.get('/weatherdata', function(req, res) {
    var jsonFile = fs.readFileSync(__dirname + '/data/weatherData.json')
    var jsonData = JSON.parse(jsonFile)
    fetchAndCreateJSON()
    res.json(jsonData)
})

/**
 * Listen command
 */
app.listen(port, () => console.log('Application listening on port: ' + port))