const {Pool, Client} = require('pg');
const tmi = require('tmi.js');
const fs = require('fs');

const twitchLogging = require('./twitchLogging.js');

// connect to database
const sqlPool = new Client({
    user: process.env.dbuser,
    host: process.env.dbhost,
    database: process.env.database,
    password: process.env.dbpassword,
    port: process.env.dbport
});
sqlPool.connect();

// connect to twitch
client = new tmi.client({"connection":{"reconnect":true}});
client.connect();

// start logging
twitchLogging.start(sqlPool, client);


