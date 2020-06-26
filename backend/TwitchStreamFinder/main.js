const {Pool, Client} = require('pg');
const fs = require('fs');

const {TwitchTokenGrabber} = require('./twitchTokenGrabber.js');
const streamFinder = require('./streamFinder.js');

// connect to database
const sqlPool = new Client({
    user: process.env.dbuser,
    host: process.env.dbhost,
    database: process.env.database,
    password: process.env.dbpassword,
    port: process.env.dbport
});
sqlPool.connect();

// create api token grabber
const tokenGrabber = new TwitchTokenGrabber({
    ClientID: process.env.twitchclientid,
    Authorization: process.env.twitchsecret
});

// start finding twitch streamers
streamFinder.start(sqlPool, tokenGrabber);