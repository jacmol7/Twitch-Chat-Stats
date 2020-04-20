const tmi = require('tmi.js');
const chalk = require('chalk');
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
        wordCollection.findOne({_id:word, total:"$exists"}).then(document => {
            // updating an existing word
            if (document) {
                if(document.streamer[channel]) {
                    document.streamer[channel] += wordCounts.get(word);
                } else {
                    document.streamer[channel] = wordCounts.get(word);
                }
                document.total = document.total + wordCounts.get(word);
                wordCollection.replaceOne({_id:word}, document);
            } 
            // inserting a new word
            else {
                let newDocument = {
                    _id: word,
                    word: word,
                    streamer: {},
                    isEmote: false
                }
                newDocument.streamer[channel] = wordCounts.get(word);
                newDocument.total = wordCounts.get(word);
                if(emoteCounts.has(word)) {
                    newDocument.isEmote = true
                    newDocument.emoteID = emoteCounts.get(word).emoteID;
                }
                wordCollection.insertOne(newDocument);
            }
        }).catch(error => {
            console.error(error);
        });
    }

    //console.log(`${chalk.hex(user.color || '#FFFFFF')(user.username)} : ${msg.trim()}`);
}

function onConnectedHandler(address, port) {
    console.log(`Connected to ${address}:${port}`);
}