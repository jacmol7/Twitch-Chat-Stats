const request = require('request');
const fs = require('fs');
const {Pool, Client} = require('pg');
const sqlCon;

exports.start = (client) => {
    const twitchApiSettings = JSON.parse(fs.readFileSync('twitchApiSettings.json'));
    sqlCon = client;
    makeRequest(false, twitchApiSettings);
}

function makeRequest(pagination, db, twitchSettings) {
    let options = {
        url: 'https://api.twitch.tv/helix/streams?first=100',
        headers: {
            'Client-ID': twitchSettings.ClientID,
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

            const query = "INSERT INTO streamer(name) VALUES($1) ON CONFLICT ON CONSTRAINT streamer_pk DO NOTHING";
            const values = [streamer.user_name];
            sqlCon.query(query, values, (err, res) => {
                if(err) {
                    console.error(err);
                    return;
                }
            });
        }

        // make next request if more pages are available
        if(data.pagination) {
            //makeRequest(data.pagination.cursor, db);
            setTimeout(makeRequest,2000,data.pagination.cursor, twitchSettings);
        }
    });
}