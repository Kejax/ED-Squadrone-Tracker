
// Node.js libraries
const EventEmitter = require('node:events');
const path = require('path');
const os = require('os');
const fs = require('fs');

// 3rd party libraries used to track events in the journal file
const { Tail } = require('tail');
const chokidar = require('chokidar');

class JournalError extends Error {
    constructor(message) {
        super(message);
    }
}

class EliteJournalWatcher extends EventEmitter {

    options = {};
    tailInstance;
    chokidarInstance;
    currentFile;

    constructor(options) {
        super()

        // Assign values to option property and use the given value. If undefined, use the default value
        
        options = options || {};
        this.options.path = options.path || path.join(os.homedir(), 'Saved Games/Frontier Developments/Elite Dangerous')

    }

    getLatestJournalFile() {
        let files = fs.readdirSync(this.options.path);
        files = files.filter(e => e.startsWith('Journal.'));
        files.sort();
        files.reverse();

        return files[0];
    }

    start() {
        if (this.tailInstance) {
            throw new JournalError("Listener is already listening.")
        }

        const file = this.getLatestJournalFile();

        this.currentFile = file;
        
        this.tailInstance = new Tail(path.join(this.options.path, file));
        this.tailInstance.on('line', this.tailListener);

        if (this.chokidarInstance == null) {
            this.chokidarInstance = chokidar.watch('.', {cwd: this.options.path});
            
            this.chokidarInstance.on('add', this.chokidarListener.bind(this));

        } else {
            this.chokidarInstance.add('.');
        }

    }

    stop() {
        if (!this.tailInstance) {
            throw new JournalError("Listener is not running.");
        }

        if (this.chokidarInstance) {
            this.chokidarInstance.unwatch('.');
        }

        this.tailInstance.unwatch();
        this.tailInstance = null;

    }

    tailListener(data) {

        var jsonData = JSON.parse(data);

        this.emit(jsonData.event, jsonData);

    }

    chokidarListener(path, stats) {

        if (path.startsWith('Journal.') && path != this.currentFile) {
            this.stop();
            this.start();
        }
    }

}

module.exports.EliteJournalWatcher = EliteJournalWatcher;
module.exports.JournalError = JournalError;