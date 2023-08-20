const axios = require('axios');

class InaraHandler {

    #inaraAPIURL = ' https://inara.cz/inapi/v1/';
    #eventWaitingForSend = [];
    commanderName;
    commanderFID;

    constructor(commanderName, FID) {
        this.commanderName = commanderName;
        this.commanderFID = FID;
    }

    addEvent(eventBody) {
        this.#eventWaitingForSend.push(eventBody);
    }

    sendEvents(inaraApiKey) {
        axios.post(this.#inaraAPIURL, {
            header: {
                appName: 'Squadrone Tracker',
                    appVersion: process.env.npm_package_version,
                    isBeingDeveloped: true,
                    APIkey: inaraApiKey,
                    commanderName: this.commanderName,
                    commanderFrontierID: this.commanderFID
            },
            events: this.#eventWaitingForSend
        })
    }

    sendSingleEvent(inaraApiKey, event) {
        axios.post(this.#inaraAPIURL, {
            header: {
                appName: 'Squadrone Tracker',
                    appVersion: process.env.npm_package_version,
                    isBeingDeveloped: true,
                    APIkey: inaraApiKey,
                    commanderName: this.commanderName,
                    commanderFrontierID: this.commanderFID
            },
            events: [event]
        })
    }

}



exports.InaraHandler = InaraHandler