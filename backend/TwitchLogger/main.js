const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');

const twitchLogging = require('./twitchLogging.js');

const dbOptions = JSON.parse(fs.readFileSync('mongodbSettings.json'));
const url = `mongodb://${dbOptions.username}:${dbOptions.password}@${dbOptions.address}:${dbOptions.port}/?compressors=zlib`;

MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err, client) => {
    if(err) {
        console.error(err);
        return;
    }
    twitchLogging.start(client);
});