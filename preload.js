const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    ping: () => ipcRenderer.invoke('ping')
})

contextBridge.exposeInMainWorld('events', {
    handleJournalEvent: (callback) => ipcRenderer.on('journal-event', callback),
    handleJournalShutdown: (callback) => ipcRenderer.on('journal-event-Shutdown', callback),
    handleJournalDocked: (callback) => ipcRenderer.on('journal-event-Docked', callback),
    handleJournalUndocked: (callback) => ipcRenderer.on('journal-event-Undocked', callback),
    handleJournalMusic: (callback) => ipcRenderer.on('journal-event-Music', callback),
})

ipcRenderer.on('test', (_event, data) => console.log(data));