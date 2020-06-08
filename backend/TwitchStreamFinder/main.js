const {Pool, Client} = require('pg');
const fs = require('fs');

const streamFinder = require('./streamFinder.js');

// read config files
const dbOptions = JSON.parse(fs.readFileSync('sqlSettings.json'));

// connect to database
const sqlPool = new Pool({
    user: dbOptions.user,
    host: dbOptions.host;
    database: dbOptions.database,
    Password: dbOptions.password,
    port: dbOptions.port
});
sqlPool.connect();

// start finding twitch streamers
streamFinder.start(sqlPool);