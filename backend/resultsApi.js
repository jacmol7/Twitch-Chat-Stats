const express = require('express');
const app = express();
const port = 3000;
var wordCollection;

app.get('/', (req, res) => {
    console.log(req);
    res.send('Hello World!');
});

/* app.get('*', (req, res) => {
    console.log(req.query.test);
    res.send('wildcard');
}); */

// top word

// top word for streamer
app.get('/topword', (req, res) => {
    // retrieve name of streamer from get params
    const streamer = req.query.streamer;
    if (!streamer) {
        res.send({
            error: 'No streamer was specified'
        });
        return;
    }
    const streamerIndex = "streamer."+streamer;
    console.log(streamer);

    // retrieve number of results requested from get params
    let max = req.query.max;
    if (!max) {
        max = 1;
    }
    if (isNaN(max)) {
        res.send({
            error: "Max count was not a number"
        });
        return;
    }
    console.log(max);
    
    let query = {isEmote: {"$eq": false}, word: {"$exists": true}};
    query[streamerIndex] = {"$exists": true}
    
    let sort = {};
    sort[streamerIndex] = -1;
    
    let filter = {projection: {_id: 0, word: 1}};
    filter.projection[streamerIndex] = 1

    wordCollection.find(query, filter).sort(sort).toArray().then(result => {
        res.send(result.slice(0,max));
    });
    
});

// top emote

// top emote for streamer

exports.start = client => {
    wordCollection = client.db('twitch').collection('word');
    app.listen(port, () => console.log(`listening at http://localhost:${port}`));
}