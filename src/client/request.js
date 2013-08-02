'use strict';

var https = require('https');
var simConfig = require(__dirname + '/../utils/config');


function sendRequest(msg,obj,callback, err) {
    out.debug("sending message:", msg);
    out.debug("sending message:", obj);

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
        out.error('Request could not be sent: ' + e.message);
        err(e);
    });

    req.write(msg);
    req.end();
}

module.exports = sendRequest;


