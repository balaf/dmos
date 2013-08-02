'use strict';

var https = require('https');


var simulator = require(__dirname + '/../simulator');



function sendRequest(msg,obj,callback) {
    var simConfig = simulator.getSimConfig();
    var options = {
        ciphers: 'DES-CBC-SHA',
        host: simConfig.serverAddress,
        port: 18443,
        path: '/DeploymentService/LoginService',
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml; charset=UTF-8',
            'Content-Length': Buffer.byteLength(msg),
            'Cookie' : obj.cookie
        }
    };

    var req = https.request(options,callback);

    req.on('error', function(e) {
        log.error('Request could not be sent: ' + e.message);
        simulator.setFailed();
    });

    req.write(msg);
    req.end();
}

module.exports = sendRequest;


