const tmi = require('tmi.js');
//const chalk = require('chalk');
const fs = require('fs');

var wordCollection;
var client;
const options = JSON.parse(fs.readFileSync('twitchSettings.json'));

exports.start = (database) => {
    wordCollection = database.db('twitch').collection('word');
    client = new tmi.client(options);
    client.on('message', onMessageHandler);
    client.on('connected', onConnectedHandler);
    client.connect();
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
        if(!wordCounts.has(word)) {
            wordCounts.set(word, 1);
        } else {
            wordCounts.set(word, wordCounts.get(word)+1);
        }
    });

    // write to database
    for (let word of wordCounts.keys()) {
        if(!emoteCounts.get(word)) {
            let updateOp = {$inc: {}};
            updateOp.$inc["streamer."+channel] = wordCounts.get(word);
            updateOp.$inc.total = wordCounts.get(word);
            wordCollection.findOneAndUpdate({word:word, isEmote:false},updateOp,{upsert:true}).catch(e => {
                console.log(e);
            });
        } else {
            let updateOp = {$inc: {}, $set: {}};
            updateOp.$inc["streamer."+channel] = wordCounts.get(word);
            updateOp.$inc.total = wordCounts.get(word);
            updateOp.$set.emoteID = emoteCounts.get(word).emoteID;
            wordCollection.findOneAndUpdate({word:word, isEmote:true},updateOp,{upsert:true}).catch(e => {
                console.log(e);
            });
        }
    }

    //console.log(`${chalk.hex(user.color || '#FFFFFF')(user.username)} : ${msg.trim()}`);
}

function onConnectedHandler(address, port) {
    console.log(`Connected to ${address}:${port}`);
}