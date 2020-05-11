const request = require('request');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;

exports.start = (client) => {
    const twitchApiSettings = JSON.parse(fs.readFileSync('twitchApiSettings.json'));
    const streamerCollection = client.db('twitchtest').collection('streamer');
    makeRequest(false, streamerCollection, twitchApiSettings);
}

function makeRequest(pagination, db, twitchSettings) {
    let options = {
        url: 'https://api.twitch.tv/helix/streams?first=100',
        headers: {
            'Client-ID': twitchSettings.Client-ID,
            'Authorization': twitchSettings.Authorization
        }
    };

    // add pagination key if this request is not for the first page
    if(pagination) {
        options.url = options.url + `&after=${pagination}`
    }
    
    console.log('-------------------------------');
    request(options, (error, response, body) => {
        // stop if an error occured
        if(error) {
            console.error(error);
            return;
        }

        //parse response data
        let data = JSON.parse(response.body);

        // stop if an error has occured
        if(data.error) {
            console.error(data);
            return;
        }
        if(!data.data){
            console.error(data);
            return;
        }

        // add streamer names to database
        for(let streamer of data.data) {
            console.log(streamer.user_name);

            let updateOp = {$set: {}};
            updateOp.$set.name = streamer.user_name;
            db.findOneAndUpdate({name:streamer.user_name},updateOp,{upsert:true}).catch(e => {
                console.error(e);
            });
        }

        // make next request if more pages are available
        if(data.pagination) {
            //makeRequest(data.pagination.cursor, db);
            setTimeout(makeRequest,2000,data.pagination.cursor, db);
        }
    });
}