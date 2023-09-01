
const { app, Tray, Menu, nativeImage, BrowserWindow, ipcMain, Notification, MessageChannelMain, utilityProcess } = require('electron');
const path = require('path');

const axios = require('axios');

const settings = require('electron-settings');

settings.configure({prettify: true})

const os = require('os');
const fs = require('fs');
const readline = require('readline');

const { Tail } = require('tail');
const chokidar = require('chokidar');

const { Commander } = require('./models.js');
const { InaraHandler } = require('./inaraHandler.js');

if (require('electron-squirrel-startup')) app.quit();

// TODO maybe add own implementation of auto updating, with a custom update window
require('update-electron-app')();

const gotTheLock = app.requestSingleInstanceLock();
let win

// Sets the protocol for ED Squadrone Tracker
if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('ed-squadrone-tracker', process.execPath, [path.resolve(process.argv[1])])
    }
} else {
    app.setAsDefaultProtocolClient('ed-squadrone-tracker')
}

// Checks if the App is the first/only instance of it
// Also handles the opened protocol
if (!gotTheLock) {
    app.quit()
} else {
    // Handler if a second instance was opened
    app.on('second-instance', (event, commandLine, workingDirectory) => {

        if (win) {
            if(win.isMinimized()) win.restore()
            win.focus()
        }

        // Just for debug rightnow, as protocol handling ist still being added
        //console.log(commandLine.pop())
        win.webContents.send('test', commandLine.pop())

    })
}

// Get the latest journal file
journalPath = path.join(os.homedir(), 'Saved Games/Frontier Developments/Elite Dangerous');

filesFound = false
var tail;
var currentJournalFile;

// TODO Write a class that represents current commander informations, such as current system, ship, etc.
var commanderInformation
const inaraHandler = new InaraHandler

// Function for loading the latest Journal
async function loadJournal() {
    if (true) {

        // Tries to find the latest Journal
        files = fs.readdirSync(journalPath)
    
        files = files.filter(e => e.startsWith('Journal.'))
        files.sort();
        files.reverse();

        if (files[0] === currentJournalFile) {
            return
        }

        currentJournalFile = files[0];

        if (tail) {
            tail.unwatch();
        }

        const fileStream = fs.createReadStream(path.join(journalPath, files[0]));
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        // Load the history of the content file if tracker was started after the game start
        for await (const line of rl) {
            pastData = JSON.parse(line);
            if (pastData.event === 'Commander') {
                console.log('Commander Event!')
                commanderInformation = new Commander(pastData.Name, pastData.FID)
                console.log(commanderInformation.name, commanderInformation.fid)
            } else if (pastData.event === 'Location') {
                commanderInformation.starsytemName = pastData.StarSystem;
                if (pastData.Docked) {
                    commanderInformation.stationname = pastData.StationName;
                }
            } else if (pastData.event === 'FSDJump') {
                commanderInformation.starsytemName = pastData.StarSystem;
            } else if (pastData.event === 'Docked') {
                commanderInformation.stationName = pastData.StationName;
            } else if (pastData.event === 'Undocked') {
                commanderInformation.stationName = undefined
            } else if (pastData.event === 'CarrierJump') {
                commanderInformation.starsystemName = pastData.SystemName;
            }
        }
        // Close the filestream for safety
        fileStream.close()
        
        // Creates a new Tail for the latest Journal
        tail = new Tail(path.join(journalPath, files[0]));

        // A new event occured in the journal
        tail.on('line', (data) => {
            jsonData = JSON.parse(data)

            // Send the event to the frontend, whatever event occured
            win.webContents.send('journal-event', jsonData)
            
            // Handler if "MissionAccepted" event occured
            if (jsonData.event === "MissionAccepted") {
                // Convert data to INARA input json
                const  inaraInput = {
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

                // TODO Add the INARA post function
                /*axios.post('post', {
                    header: {
                        appName: 'Squadrone Tracker',
                        appVersion: process.env.npm_package_version,
                        isBeingDeveloped: true,
                        APIkey: settings.getSync('inaraApiKey'),
                        commanderName: commanderInformation.name,
                        commanderFrontierID: commanderInformation.FID
                    },
                    events: [
                        inaraInput
                    ]
                })*/
            }

            // Handler if "Location" event occured
            if (jsonData.event === 'Location') {
                commanderInformation.starsystemName = jsonData.StarSystem;
                if (jsonData.Docked) {
                    commanderInformation.stationName = jsonData.StationName;
                }
            }
            // Handler if "FSDJump" event occured
            else if (jsonData.event === 'FSDJump') {
                commanderInformation.starsystemName = jsonData.StarSystem;
            }
            // Handler if "Docked" event occured
            else if (jsonData.event === "Docked") {
                commanderInformation.stationName = jsonData.StationName;
                win.webContents.send('journal-event-Docked', jsonData) // Send "Docked" event to the frontend

                // Send a notification about the docking
                // TODO Implement "windows-notification-state" for checking if the notification would be visible
                // TODO Implement "electron-windows-notifications" and "electron-windows-interactive-notifications" for better notifications
                /*new Notification({
                    toastXml: `
                    <toast launch="ed-squadrone-tracker:action=station&amp;marketId=${jsonData.MarketID}" activationType="protocol">
                        <visual>
                            <binding template="ToastGeneric">
                                <text>ED Squadrone Tracker</text>
                                <text>Docked at ${jsonData.StationName}</text>
                            </binding>
                        </visual>
                        <actions>
                            <action
                                content="Open in App"
                                arguments="ed-squadrone-tracker:action=viewDetails&amp;contentId=351"
                                activationType="protocol"/>
    
                            <action
                                content="Open on Inara"
                                arguments="ed-squadrone-tracker:action=remindlater&amp;contentId=351"
                                activationType="protocol"/>
                        </actions>
                    </toast>`
                }).show()*/
            }
            // Handler if "Undocked" event occured
            else if (jsonData.event === 'Undocked') {
                commanderInformation.stationname = undefined;
            }
            // Handler if "CarrierJump" event occured
            else if (jsonData.event === 'CarrierJump') {
                commanderInformation.starsystemName = jsonData.StarSystem;
            }

        })
    
        return true;
    }
    // } catch (error) {
    //     //if (error.code === 'ENOENT') {
    //     return false
    // }
}

function createWebServerProcess() {
    // This function is used to create a Utility Process which is being used to create a local webserver for Streamers
    // Streamers are able to add live updated data to their stream, like current ship, position, group, system, station, etc.
    // The webservers script can be found in streamserver.js

    const { port1, port2 } = new MessageChannelMain()
    const child = utilityProcess.fork(path.join(__dirname, 'streamserver.js'))

    return child
}

// Loads the latest journal
try {
    filesFound = loadJournal();

    // Add a directory watcher that reloads the journal (if app is running overnight or 500k events have been reached)
    const JournalPathWatcher = chokidar.watch('.', {
        cwd: journalPath
    });
    JournalPathWatcher.on('add', (path) => {
        if (path.startsWith('Journal.')) {
            loadJournal()
        }
    })
} catch (error) {
    filesFound = false;
}

if(process.env.EDST !== 'developer') app.applicationMenu = null;

// Sets the app's about menu
app.setAboutPanelOptions({
    applicationName: 'ED Squadrone Tracker',
    applicationVersion: 'V0.0.1-beta1',
    copyright: 'Copyright 2023 Kejax & Fliegevieh',
    website: 'https://github.com/Kejax/ED-Squadrone-Tracker'
})

// Function to create and load the default window
const createWindow = () => {
    const win = new BrowserWindow({
        width: 1920,
        height: 1080,
        icon: 'img/ed-squadrone-tracker-transparent.png',
        //autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        titleBarOverlay: {
            color: "#0000FF00",
            height: 50
        }
    })

    win.on('close', (event) => {
        win.hide();
        event.preventDefault();
    })

    win.loadFile('pages/index.html')

    return win
}

// App on ready listener, waits untill the app is ready
if (gotTheLock) {
    app.on('ready', () => {

        // Sets if the files for events were found
        ipcMain.on('journal-files-found', () => {return filesFound});

        // Create a tray with the icon 'tray.png'
        const trayIcon = nativeImage.createFromPath(path.join(__dirname, 'img/ed-squadrone-tracker-tray.png'));
        tray = new Tray(trayIcon);

        // Add window show functionality on double click tray
        tray.on('double-click', (event, bounds) => {
            if (BrowserWindow.getAllWindows().length === 0) {win = createWindow(); console.log("TEST")}
            else win.show()
        })

        // Creates the contextmenu for the tray
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Squadrone Tracker', type: 'normal' , enabled: false, icon: trayIcon, },
            { type: 'separator' },
            { label: "About", type: 'normal', role: 'about' },
            { type: 'separator'},
            { label: 'Quit EDDB', type: 'normal', click: () => {
                win.destroy();
                app.quit()
            } },
        ])

        // Sets the contextmenu for the tray
        tray.setContextMenu(contextMenu);
        tray.description = "EDDB"
        
        // IPC Handling between renderer and main
        ipcMain.handle('ping', () => icon.toBitmap()); // Just for fun and such
        ipcMain.handle('setInaraApiKey', (_event, value) => settings.setSync('inaraApiKey', value))
        ipcMain.handle('getInaraApiKey', () => {console.log(settings.getSync('inaraApiKey'));return settings.getSync('inaraApiKey')})

        // Calls our function to create a window
        win = createWindow();

    })
}

// Prevents the app from quitting when all windows have been closed
app.on('window-all-closed', e => e.preventDefault() )