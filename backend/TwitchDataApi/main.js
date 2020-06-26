const {Pool, Client} = require('pg');
const fs = require('fs');

const resultsApi = require('./resultsApi.js');

// read config files
//const dbOptions = JSON.parse(fs.readFileSync('sqlSettings.json'));

// connect to database
const sqlPool = new Client({
    user: process.env.dbuser,
    host: process.env.dbhost,
    database: process.env.database,
    password: process.env.dbpassword,
    port: process.env.dbport
});
sqlPool.connect();

// start results api
resultsApi.start(sqlPool);