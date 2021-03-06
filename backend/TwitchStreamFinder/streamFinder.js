const got = require('got');
const fs = require('fs');

var sqlCon;
var tokenGrabber;

exports.start = (dbClient, twitchTokenGrabber) => {
    const twitchApiSettings = {
        ClientID: process.env.twitchclientid,
        Authorization: process.env.twitchsecret
    };
    sqlCon = dbClient;
    tokenGrabber = twitchTokenGrabber;
    tokenGrabber.getToken().then((token) => {
        console.log(`Bearer ${token}`);
        makeRequest(false, twitchApiSettings, token, 1);
    });
}

function makeRequest(pagination, twitchSettings, token, pageNo) {
    let url = 'https://api.twitch.tv/helix/streams?first=100';
    let headers = {
        headers: {
            'Client-ID': twitchSettings.ClientID,
            'Authorization': `Bearer ${token}`
        }
    }

    // add pagination to the url
    if(pagination) {
        url += `&after=${pagination}`;
    }

    got(url, headers).json().then((data) => {
        //console.log(data);

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
            const query = "INSERT INTO streamer(name, lastSeen) VALUES($1, NOW()) ON CONFLICT ON CONSTRAINT streamer_pk DO UPDATE SET lastSeen = EXCLUDED.lastSeen RETURNING *";
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
            if(pageNo < 10) {
                setTimeout(makeRequest,2000,data.pagination.cursor, twitchSettings, token, pageNo+1);
            } else {
                setTimeout(makeRequest,2000, false, twitchSettings, token, 1);
            }
        }
    }).catch((error) => {
        console.error(error);
        // if access was denied
        if(error.name === 'HTTPError') {
            // get a new access token and retry
            tokenGrabber.getToken().then((newToken) => {
                makeRequest(false, twitchSettings, newToken, 1)
            });
        }
    });
}