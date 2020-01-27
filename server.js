var express = require('express')
var vue = require('vue');
var nodeSchedule = require('node-schedule');

const port = 8080
const app = express()

app.use(express.static('static'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/vue', express.static(__dirname + '/node_modules/vue/dist/'));
app.use('/bootstrap', express.static(__dirname + '/bootstrap/dist/'));
app.use('/bootstrap-vue', express.static(__dirname + '/bootstrap-vue/dist/'));

app.get('/', (req, res) => res.send('index.html'))
app.listen(port, () => console.log('Application listening on port: ' + port))
