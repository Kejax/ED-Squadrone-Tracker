
const { app, Tray, Menu, nativeImage, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const os = require('os');
const fs = require('fs');

const { Tail } = require('tail');
const chokidar = require('chokidar');

if (require('electron-squirrel-startup')) app.quit();

require('update-electron-app')();

// Get the latest journal file
journalPath = path.join(os.homedir(), 'Saved Games/Frontier Developments/Elite Dangerous');

filesFound = false
var tail;

// Function for loading the latest Journal
function loadJournal() {
    try {
        files = fs.readdirSync(journalPath)
    
        files = files.filter(e => e.startsWith('Journal.'))
        files.sort();
        files.reverse();
        if (tail) {
            tail.unwatch();
        }
        tail = new Tail(path.join(journalPath, files[0]));

        tail.on('line', (data) => {
            //console.log(data);
            jsonData = JSON.parse(data)
            win.webContents.send('journal-event', data)

            if (data.event === "Docked") {
                win.webContents.send('journal-event-Docked', data)
            }

        })
    
        return true;
    
    } catch (error) {
        //if (error.code === 'ENOENT') {
        return false
    }
}

// Loads the latest journal
try {
    filesFound = loadJournal();

    // Add a directory watcher that reloads the journal (if app is running overnight or 500k events have been reached)
    const JournalPathWatcher = chokidar.watch('.', {
        cwd: journalPath
    });
    JournalPathWatcher.on('add', (path) => {
        console.log(path)
        if (path.startsWith('Journal.')) {
            loadJournal()
        }
    })
} catch (error) {
    filesFound = false;
}



// Set User tasks
app.setUserTasks([
    {
        program: process.execPath,
        arguments: '--new-window',
        iconPath: process.execPath,
        iconIndex: 0,
        title: "New Window",
        description: "Create a new Window"
    }
])

// Function to create and load the default window
const createWindow = () => {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: 'tray.png',
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
app.on('ready', () => {

    // Sets if the files for events were found
    ipcMain.on('journal-files-found', () => {return filesFound});

    // Create a tray with the icon 'tray.png'
    const icon = nativeImage.createFromPath('tray.png');
    tray = new Tray(icon);

    // Add window show functionality on double click tray
    tray.on('double-click', (event, bounds) => {
        if (BrowserWindow.getAllWindows().length === 0) {win = createWindow(); console.log("TEST")}
        else win.show()
    })

    // Creates the contextmenu for the tray
    const contextMenu = Menu.buildFromTemplate([
        { label: 'EDDB', type: 'normal' , enabled: false},//, icon: 'tray_icon.png',  },
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
    ipcMain.handle('ping', () => 'pong'); // Just for fun and such

    // Calls our function to create a window
    win = createWindow();

    // MacOS functionality to create a window if none exists
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) win = createWindow()
    })
});

// Prevents the app from quitting when all windows have been closed
app.on('window-all-closed', e => e.preventDefault() )