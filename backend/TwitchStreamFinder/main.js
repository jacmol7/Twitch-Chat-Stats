const {Pool, Client} = require('pg');
const fs = require('fs');

const {TwitchTokenGrabber} = require('./twitchTokenGrabber.js');
const streamFinder = require('./streamFinder.js');

// read config files
const dbOptions = JSON.parse(fs.readFileSync('sqlSettings.json'));
const twitchSettings = JSON.parse(fs.readFileSync('twitchApiSettings.json'));

// connect to database
const sqlPool = new Pool({
    user: dbOptions.user,
    host: dbOptions.host,
    database: dbOptions.database,
    password: dbOptions.password,
    port: dbOptions.port
});
sqlPool.connect();

// create api token grabber
const tokenGrabber = new TwitchTokenGrabber(twitchSettings);

// start finding twitch streamers
streamFinder.start(sqlPool, tokenGrabber);