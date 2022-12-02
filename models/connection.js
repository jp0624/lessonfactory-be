var mysql = require('mysql');
var env = process.env.NODE_ENV || 'dev';
var config = require('../config')[env];

var pool = mysql.createPool({
    connectionLimit: 50, //important
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    acquireTimeout: 1000000
});

pool.getConnection(function (err, connection) {
    if (err) {
        console.log(err);
        //res.json({"code" : 100, "status" : "Error in connection database"});
        return;
    }
    console.log('connected as id ' + connection.threadId);


})

module.exports = pool;
