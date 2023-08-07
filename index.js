
const { app, Tray, Menu, nativeImage, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

if (require('electron-squirrel-startup')) app.quit();

require('update-electron-app')();

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.on('close', (event) => {
        win.hide();
        event.preventDefault();
    })

    win.on('show', () => {
        console.log("It really hides!");
    })

    win.loadFile('index.html')

    return win
}

app.on('ready', () => {

    const icon = nativeImage.createFromPath('tray.png');
    tray = new Tray(icon);

    tray.on('double-click', (event, bounds) => {
        if (BrowserWindow.getAllWindows().length === 0) {win = createWindow(); console.log("TEST")}
        else win.show()
    })

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Exit', type: 'normal', click: () => {
            win.destroy();
            app.quit()
        } }
    ])

    tray.setContextMenu(contextMenu);
    
    ipcMain.handle('ping', () => 'pong');

    win = createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) win = createWindow()
    })
});

app.on('window-all-closed', e => e.preventDefault() )

/*app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})*/