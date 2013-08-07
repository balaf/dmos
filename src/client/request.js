'use strict';

var https = require('https');
var fs = require('fs');


var simulator = require(__dirname + '/../simulator');



function sendRequest(msg,obj,callback) {
    var simConfig = simulator.getSimConfig();
    var options = {
        //ciphers: 'DHE-RSA-AES128-SHA256',
        secureProtocol: 'TLSv1_client_method',
        host: simConfig.serverAddress,
        port: 18443,
        path: '/DeploymentService/LoginService',
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml; charset=UTF-8',
            'Content-Length': Buffer.byteLength(msg),
            'Cookie' : obj.cookie
        } ,
        key: fs.readFileSync( __dirname + '/../../cert/key.pem'),
        cert: fs.readFileSync( __dirname + '/../../cert/cert.pem'),
        ca: fs.readFileSync( __dirname + '/../../cert/cert.pem'),
        rejectUnauthorized: false
    };
    out.info("Header:", options.headers)

    var req = https.request(options,callback);
    //out.debug("Sending request:", msg);
    req.on('error', function(e) {
        log.error('Request could not be sent: ' + e.message);
        out.error('Request could not be sent: ' + e.message);
        simulator.setFailed();
    });

    req.write(msg);
    req.end();
}

module.exports = sendRequest;


