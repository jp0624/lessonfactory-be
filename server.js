var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
require('dotenv').config();
var env = process.env.NODE_ENV || 'dev';
var config = require('./config')[env];

// Initialize Express App
var app = express();
// Use Middlewares

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Set Static Path
app.use('/', express.static(__dirname));

// Import API Routes
app.use(require('./api/lesson_api'));

//app.use(config);

app.listen({
  host: config.server.host,
  port: config.server.port,
  exclusive: true
},
function() {
        console.log("listening to port " + config.server.port);
        console.log("in environment " + env);
});
