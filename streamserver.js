//const { process } = require('electron'); 

process.parentPort.on('message', (e) => {
    //const [port] = e.ports
    process.parentPort.postMessage(e.data)
  })

// TODO Add the webserver for the streaming endpoints