const {Pool, Client} = require('pg');
const fs = require('fs');

const resultsApi = require('./resultsApi.js');

// read config files
const dbOptions = JSON.parse(fs.readFileSync('sqlSettings.json'));

// connect to database
const sqlPool = new Pool({
    user: dbOptions.user,
    host: dbOptions.host,
    database: dbOptions.database,
    password: dbOptions.password,
    port: dbOptions.port
});
sqlPool.connect();

// start results api
resultsApi.start(sqlPool);