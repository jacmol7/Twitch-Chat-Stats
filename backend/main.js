const MongoClient = require('mongodb').MongoClient;
const twitchLogging = require('./twitchLogging.js');
const resultsApi = require('./resultsApi.js');
const fs = require('fs');

const dbOptions = JSON.parse(fs.readFileSync('mongodbSettings.json'));
const url = `mongodb://${dbOptions.username}:${dbOptions.password}@jacmol.com:27017/?compressors=zlib`;

MongoClient.connect(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, (err, client) => {
    if(err) {
        console.error(err);
        return;
    }

    twitchLogging.start(client);
    resultsApi.start(client);
  });