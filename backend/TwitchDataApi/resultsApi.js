const express = require('express');
const app = express();
const port = 3000;
var sqlCon;

exports.start = client => {
    sqlCon = client;
    app.listen(port, () => console.log(`listening at http://localhost:${port}`));
}

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
    
    const query = "SELECT word, count FROM word WHERE streamer=$1 AND isEmote=false ORDER BY count DESC";
    const values = [streamer];

    sqlCon.query(query, values, (err, result) => {
        if(err) {
            res.send({
                error: err
            });
            return;
        }
        res.send(result.rows.slice(0,max));
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
    
    const query = "SELECT word, emoteID, count FROM word WHERE streamer=$1 AND isEmote=true ORDER BY count DESC";
    const values = [streamer];

    sqlCon.query(query, values, (err, result) => {
        if(err) {
            res.send({
                error: err
            });
            return;
        }
        res.send(result.rows.slice(0,max));
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
    
    const query = "SELECT word, SUM(count) as count FROM word WHERE isEmote=false GROUP BY word ORDER BY SUM(count) DESC";
    const values = [];

    sqlCon.query(query, values, (err, result) => {
        if(err) {
            res.send({
                error: err
            });
            return;
        }
        res.send(result.rows.slice(0,max));
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

    const query = "SELECT word, emoteID, SUM(count) as count FROM word WHERE isEmote=true GROUP BY word,emoteID ORDER BY SUM(count) DESC";
    const values = [];

    sqlCon.query(query, values, (err, result) => {
        if(err) {
            res.send({
                error: err
            });
            return;
        }
        res.send(result.rows.slice(0,max));
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

    const query = "SELECT streamer, count FROM word WHERE word = $1 AND isEmote=false ORDER BY count DESC";
    const values = [word];

    sqlCon.query(query, values, (err, result) => {
        if(err) {
            res.send({
                error: err
            });
            return;
        }
        res.send(result.rows);
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

    const query = "SELECT streamer, count FROM word WHERE word = $1 AND isEmote=true ORDER BY count DESC";
    const values = [emote];

    sqlCon.query(query, values, (err, result) => {
        if(err) {
            res.send({
                error: err
            });
            return;
        }
        res.send(result.rows);
    });
});

app.get('*', (req, res) => {
    res.send({
        error: "unsupported command"
    });
});