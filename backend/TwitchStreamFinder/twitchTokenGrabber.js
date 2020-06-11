const got = require('got');

class TwitchTokenGrabber {
    constructor(settings) {
        this.settings = settings;
    }

    async getToken() {
        try {
            const url = `https://id.twitch.tv/oauth2/token?client_id=${this.settings.ClientID}&client_secret=${this.settings.Authorization}&grant_type=client_credentials`;
            const body = await got.post(url).json();
            return body.access_token;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}

module.exports = {
    TwitchTokenGrabber: TwitchTokenGrabber
}


