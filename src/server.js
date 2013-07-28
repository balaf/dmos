#!/usr/bin/env nodejs
'use strict';

var express = require('express');
var http = require('http');
var app = express();
var WebSocketServer = require('ws').Server;
var simulator = require(__dirname + '/simulator');

var simulationID;
var updateInterval;

app.use(express.static(__dirname +'/public'));
var server = http.createServer(app);
server.listen(18080);


var wss = new WebSocketServer({server: server});
wss.on('connection', function(ws) {
    console.log("client connected");
    ws.send(JSON.stringify(simulator.getConfig()));
    ws.on('close', function() {
        console.log('Client disconnected...');
    });
    ws.on('message', function(message) {
        var JSONmessage;
        try{
            JSONmessage = JSON.parse(message);
        }
        catch (err){
            JSONmessage = { text: message};
        }
        if (JSONmessage.action === "start"){
            simulationID = simulator.start(JSONmessage.config);
            updateInterval = setInterval(function(){
                ws.send(JSON.stringify(simulator.getTime()));
            },2000);
        }
        if (JSONmessage.action === "stop"){
            simulator.stop(simulationID);
            clearInterval(updateInterval);
        }

    });
});