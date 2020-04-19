const MongoClient = require('mongodb').MongoClient;
const twitchLogging = require('./twitchLogging.js');
const resultsApi = require('./resultsApi.js');
const url = 'mongodb://127.0.0.1:27017/?compressors=zlib&gssapiServiceName=mongodb';

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