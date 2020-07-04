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
    
    const query = "SELECT word, count FROM word WHERE LOWER(streamer)=$1 AND isEmote=false ORDER BY count DESC LIMIT $2";
    const values = [streamer.toLowerCase(), max];

    sqlCon.query(query, values, (err, result) => {
        if(err) {
            res.send({
                error: err
            });
            return;
        }
        const response = {
            type: 'word',
            data: result.rows
        }
        res.send(response);
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
    
    const query = "SELECT word, emoteID, count FROM word WHERE LOWER(streamer)=$1 AND isEmote=true ORDER BY count DESC LIMIT $2";
    const values = [streamer.toLowerCase(), max];

    sqlCon.query(query, values, (err, result) => {
        if(err) {
            res.send({
                error: err
            });
            return;
        }
        const response = {
            type: 'emote',
            data: result.rows
        };
        res.send(response);
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
    
    const query = "SELECT word, SUM(count) as count FROM word WHERE isEmote=false GROUP BY word ORDER BY SUM(count) DESC LIMIT $1";
    const values = [max];

    sqlCon.query(query, values, (err, result) => {
        if(err) {
            res.send({
                error: err
            });
            return;
        }
        const response = {
            type: 'word',
            data: result.rows
        };
        res.send(response);
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

    const query = "SELECT word, emoteID, SUM(count) as count FROM word WHERE isEmote=true GROUP BY word,emoteID ORDER BY SUM(count) DESC LIMIT $1";
    const values = [max];

    sqlCon.query(query, values, (err, result) => {
        if(err) {
            res.send({
                error: err
            });
            return;
        }
        const response = {
            type: 'emote',
            data: result.rows
        };
        res.send(response);
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
    const values = [word.toLowerCase()];

    sqlCon.query(query, values, (err, result) => {
        if(err) {
            res.send({
                error: err
            });
            return;
        }
        const response = {
            type: 'streamer',
            data: result.rows
        };
        res.send(response);
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

    const query = "SELECT streamer, count FROM word WHERE LOWER(word) = $1 AND isEmote=true ORDER BY count DESC";
    const values = [emote.toLowerCase()];

    sqlCon.query(query, values, (err, result) => {
        if(err) {
            res.send({
                error: err
            });
            return;
        }
        const response = {
            type: 'streamer',
            data: result.rows
        };
        res.send(response);
    });
});

app.get('/islogged', (req, res) => {
    const streamer = req.query.streamer;
    if(!streamer) {
        res.send({
            error: "No streamer was specified"
        });
        return;
    }

    const query = "SELECT * FROM streamer WHERE LOWER(name) = $1";
    const values = [streamer.toLowerCase()];
    sqlCon.query(query, values, (err, result) => {
        if(err) {
            res.send({
                error: err
            });
            return;
        }
        const response = {
            type: 'streamerDetails',
            data: result.rows
        };
        res.send(response);
    });
});

app.get('/wordsearchstreamer', (req, res) => {
    const streamer = req.query.streamer;
    const word = req.query.word;
    if(!streamer || !word) {
        res.send({
            error: "Missing word or streamer"
        });
        return;
    }

    const query = "SELECT word, streamer, count FROM word WHERE LOWER(streamer) = $1 AND word = $2 AND isemote = false";
    const values = [streamer.toLowerCase(), word.toLowerCase()];
    sqlCon.query(query, values, (err, result) => {
        if(err) {
            res.send({
                error: err
            });
            return;
        }
        const response = {
            type: 'word',
            data: result.rows
        };
        res.send(response);
    });
});

app.get('/emotesearchstreamer', (req, res) => {
    const streamer = req.query.streamer;
    const emote = req.query.emote;
    if(!streamer || !emote) {
        res.send({
            error: "Missing emote or streamer"
        });
        return;
    }

    const query = "SELECT word, emoteid, streamer, count FROM word WHERE LOWER(streamer) = $1 AND LOWER(word) = $2 AND isemote = true";
    const values = [streamer.toLocaleLowerCase(), emote.toLowerCase()];
    sqlCon.query(query, values, (err, result) => {
        if(err) {
            res.send({
                error: err
            });
            return;
        }
        const response = {
            type: 'emote',
            data: result.rows
        };
        res.send(response);
    });
});

app.get('*', (req, res) => {
    res.send({
        error: "unsupported command"
    });
});