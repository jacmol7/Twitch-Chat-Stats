const express = require('express');
const app = express();
const port = 3000;
var wordCollection;

// top word for streamer
app.get('/topwordstreamer', (req, res) => {
    // retrieve name of streamer from get params
    const streamer = req.query.streamer;
    if (!streamer) {
        res.send({
            error: 'No streamer was specified'
        });
        return;
    }
    const streamerIndex = "streamer."+streamer;

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

// top emote for streamer
app.get('/topemotestreamer', (req, res) => {
    // retrieve name of streamer from get params
    const streamer = req.query.streamer;
    if (!streamer) {
        res.send({
            error: 'No streamer was specified'
        });
        return;
    }
    const streamerIndex = "streamer."+streamer;

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
    
    let query = {isEmote: {"$eq": true}, word: {"$exists": true}, emoteID: {"$exists": true}};
    query[streamerIndex] = {"$exists": true}
    
    let sort = {};
    sort[streamerIndex] = -1;
    
    let filter = {projection: {_id: 0, word: 1, emoteID: 1}};
    filter.projection[streamerIndex] = 1

    wordCollection.find(query, filter).sort(sort).toArray().then(result => {
        res.send(result.slice(0,max));
    });
    
});

// top word
app.get('/topword', (req, res) => {
    // Retrieve max number from get params
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
    
    const query = {word: {"$exists": true}, isEmote: {"$eq": false}};
    const sort = {total: -1};
    const filter = {projection: {_id: 0}};

    wordCollection.find(query, filter).sort(sort).toArray().then(result => {
        res.send(result.slice(0,max));
    });
});

// Top emote
app.get('/topemote', (req, res) => {
    // Retrieve max number from get params
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

    const query = {word: {"$exists": true}, isEmote: {"$eq": true}};
    const sort = {total: -1};
    const filter = {projection: {_id: 0}};

    wordCollection.find(query, filter).sort(sort).toArray().then(result => {
        res.send(result.slice(0,max));
    });
});

app.get('/wordsearch', (req, res) => {
    const word = req.query.word;
    if(!word) {
        res.send({
            error: "No word was specified"
        });
        return;
    }

    const query = {word: {"$eq": word}, isEmote: {"$eq": false}};
    const filter = {projection: {_id: 0}};
    
    wordCollection.findOne(query, filter).then(result => {
        res.send(result);
    });
});

app.get('/emotesearch', (req, res) => {
    const emote = req.query.emote;
    if(!emote) {
        res.send({
            error: "No emote was specified"
        });
        return;
    }

    const query = {word: {"$eq": emote}, isEmote: {"$eq": true}};
    const filter = {projection: {_id: 0}};

    wordCollection.findOne(query, filter).then(result => {
        res.send(result);
    });
});

app.get('*', (req, res) => {
    res.send({
        error: "unsupported command"
    });
});

exports.start = client => {
    wordCollection = client.db('twitch').collection('word');
    app.listen(port, () => console.log(`listening at http://localhost:${port}`));
}