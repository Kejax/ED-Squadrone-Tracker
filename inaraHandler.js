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

    addMissionAcceptedEvent(jsonData) {
        let eventBody = {
            missionName: jsonData.Name,
            missionGameID: jsonData.MissionID,
            missionExpiry: jsonData.Expiry,
            influenceGain: jsonData.Influence,
            reputationGain: jsonData.Reputation,
            starsystemNameOrigin: commanderInformation.starsytemName,
            stationNameOrigin: commanderInformation.stationName,
            minorfactionNameOrigin: jsonData.Faction,
            starsystemNameTarget: jsonData.DestinationSystem,
            stationNameTarget: jsonData.DestinationStation,
            minorfactionNameTarget: jsonData.TargetFaction,
            commodityName: jsonData.Commodity,
            commodityCount: jsonData.Count,
            targetName: jsonData.Target,
            targetType: jsonData.TargetType,
            killCount: jsonData.KillCount,
            passengerType: PassengerType,
            passengerCount: jsonData.PassengerCount,
            passengerIsVIP: jsonData.PassengerVIPs,
            passengerIsWanted: jsonData.PassengerWanted
        }
        this.addEvent(eventBody)
    }

}



exports.InaraHandler = InaraHandler