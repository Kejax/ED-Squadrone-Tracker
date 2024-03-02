
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

const { EliteJournalWatcher } = require('./elite-journal.js');

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
      app.setAsDefaultProtocolClient('edst', process.execPath, [path.resolve(process.argv[1])])
    }
} else {
    app.setAsDefaultProtocolClient('edst')
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

const journalWatcher = new EliteJournalWatcher();

journalWatcher.start();

journalWatcher.on('Commander', (data) => {console.log(data.Name)});

// Sets the app's about menu
app.setAboutPanelOptions({
    applicationName: 'ED Squadrone Tracker',
    applicationVersion: 'v' + process.env.npm_package_version,
    copyright: 'Copyright 2024 Kejax & EDDS Team',
    website: 'https://github.com/Kejax/ED-Squadrone-Tracker'
})

// Function to create and load the default window
const createWindow = () => {
    const win = new BrowserWindow({
        width: 1920,
        height: 1080,
        minHeight: 500,
        minWidth: 1000,
        icon: 'img/ed-squadrone-tracker-transparent.png',
        //autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: "#303030",
            symbolColor: "#FFFFFF",
            height: 35
        }
    })

    win.on('close', (event) => {
        if (settings.getSync('hideToTray') === true) {
            win.hide();
            event.preventDefault();
        } else {
            app.quit()
        }
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
        const tray = new Tray(trayIcon);

        // Add window show functionality on double click tray
        tray.on('double-click', (event, bounds) => {
            if (BrowserWindow.getAllWindows().length === 0) {win = createWindow();}
            else {
                win.show();
            }

        })

        // Creates the contextmenu for the tray
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Squadrone Tracker', type: 'normal' , enabled: false, icon: trayIcon, },
            { type: 'separator' },
            { label: "About", type: 'normal', role: 'about' },
            { type: 'separator'},
            { label: 'Quit Squadrone Tracker', type: 'normal', click: () => {
                win.destroy();
                app.quit()
            } },
        ])

        // Sets the contextmenu for the tray
        tray.setContextMenu(contextMenu);
        tray.description = "EDDB"
        
        // IPC Handling between renderer and main
        ipcMain.handle('ping', () => icon.toBitmap()); // Just for fun and such

        ipcMain.handle('openAboutPanel', (data) => app.showAboutPanel())
        
        ipcMain.handle('setInaraApiKey', (_event, value) => settings.setSync('inaraApiKey', value))
        ipcMain.handle('getInaraApiKey', () => {return settings.getSync('inaraApiKey')})
        
        ipcMain.handle('setHideToTray', (_event, value) => settings.setSync('hideToTray', value))
        ipcMain.handle('getHideToTray', () => {return settings.getSync('hideToTray')})

        // Calls our function to create a window
        win = createWindow();

    })
}

// Prevents the app from quitting when all windows have been closed
app.on('window-all-closed', e => {
    if (settings.getSync('hideToTray') === true) {
        e.preventDefault()
    }
})