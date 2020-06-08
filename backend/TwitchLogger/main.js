const {Pool, Client} = require('pg');
const tmi = require('tmi.js');
const fs = require('fs');

const twitchLogging = require('./twitchLogging.js');

// read config files
const options = JSON.parse(fs.readFileSync('twitchSettings.json'));
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

// connect to twitch
client = new tmi.client(options);
client.connect();

// start logging
twitchLogging.start(sqlPool, client);


