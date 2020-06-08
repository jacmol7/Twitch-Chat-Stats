const {Pool, Client} = require('pg');
const tmi = require('tmi.js');

var sqlCon;
var twitchCon;

exports.start = (sql, twitch) => {
    sqlCon = sql;
    twitchCon = twitch;
    twitchCon.on('message', onMessageHandler);
    twitchCon.on('connected', onConnectedHandler);
}

function onConnectedHandler(address, port) {
    console.log(`Connected to ${address}:${port}`);
}

function onMessageHandler(channel, user, msg, self) {
    //stop if the message is from the bot
    if (self) { return; }

    //remove # at start of channel name
    channel = channel.substring(1);

    //count up all emotes
    const emoteCounts = new Map();
    if(user.emotes) {
        for (let [emoteID, positions] of Object.entries(user.emotes)) {
            for(let position of positions) {
                let emoteRange = position.split('-');
                let emoteName = msg.substr(emoteRange[0], emoteRange[1]-emoteRange[0]+1)
                if(emoteCounts.has(emoteName)) {
                    emoteCounts.get(emoteName).count += 1;
                } else {
                    emoteData = {
                        emoteID: emoteID,
                        count: 1
                    }
                    emoteCounts.set(emoteName, emoteData);
                }
            }
        }
    }

    // Count up all words
    const words = msg.trim().split(' ');
    let wordCounts = new Map();
    words.forEach(word => {
        // if word is not emote convert to lowercase and remove punctuation
        if(!emoteCounts.has(word)) {
            word = word.toLowerCase();
            word = word.replace(/(~|`|!|@|#|$|%|^|&|\*|\(|\)|{|}|\[|\]|;|:|\"|'|<|,|\.|>|\?|\/|\\|\||-|_|\+|=)/g,"");
        }
        if(!wordCounts.has(word)) {
            wordCounts.set(word, 1);
        } else {
            wordCounts.set(word, wordCounts.get(word)+1);
        }
    });

    // write to database
    for (let word of wordCounts.keys()) {
        const newQuery = "INSERT INTO word(word, streamer, isEmote, emoteID, count) VALUES($1,$2,$3,$4,$5) ON CONFLICT ON CONSTRAINT word_pk DO UPDATE SET count= word.count + EXCLUDED.count RETURNING *";

        let values = [word, channel]
        if(!emoteCounts.has(word)) {
            values = values.concat([false, null, wordCounts.get(word)]);
        } else {
            values = values.concat([true, emoteCounts.get(word).emoteID, wordCounts.get(word)]);
        }
        sqlCon.query(newQuery, values, (err, res) => {
        if(err) {
            console.error(err);
                return;
            }

            console.log(res.rows[0].word);
            /* if(channel === 'jacmol7') {
                console.log(res.rows);
            } */
        });
    }

}