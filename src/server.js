#!/usr/bin/env nodejs
'use strict';

// define global vaiable for logging
global.log = require(__dirname + '/utils/logger').logger;
global.out = require(__dirname + '/utils/logger').console;
global.wpilog = require(__dirname + '/utils/logger').wpilog;


var express = require('express');
var http = require('http');
var app = express();
var WebSocketServer = require('ws').Server;
var simulator = require(__dirname + '/simulator');

app.use(express.static(__dirname +'/public'));
var server = http.createServer(app);
server.listen(18080);

var simulationID;

var wss = new WebSocketServer({server: server});
wss.on('connection', function(ws) {
    var updateInterval;
    out.info("client connected");
    sendStats(ws);
    ws.on('close', function() {
        out.info('Client disconnected...');
        clearInterval(updateInterval);
    });
    ws.on('message', function(message) {
        var JSONmessage;
        var result;
        try{
            JSONmessage = JSON.parse(message);
            log.debug("Message received on the WS: ", JSONmessage);
        }
        catch (err){
            JSONmessage = { text: message};
            log.error("Message received from webSocket cannot be parsed as JSON");
        }
        if (JSONmessage.action === "start"){
            simulator.init();
            simulationID = simulator.start(JSONmessage.config);
            updateInterval = setInterval(report, 2000, ws);
        }
        if (JSONmessage.action === "stop"){
            simulator.stop(simulationID);
     /*       clearInterval(updateInterval);
            result = getResult();
            sendStats(ws,result);
            out.info("Results:", result);*/
        }
        if (JSONmessage.action === "config"){
            simulator.stop(simulationID);
            clearInterval(updateInterval);
            sendStats(ws);
            simulator.setConfig(JSONmessage);
        }
        if (JSONmessage.action === "ping"){
            if (!checkEnd()) {
              out.info("Reconnecting client to the report stream");
              updateInterval = setInterval(report, 2000, ws);
            }
        }
    });

    function report(ws){
        if (checkEnd()) {
            clearInterval(updateInterval);
        }
        sendStats(ws);
    }

    function checkEnd (){
        var result = getResult();
        var end = false;
        if (result.status.status === "finished") {
            out.info("Results:", result);
            end = true;
        }
        return end;
    }

    function getResult(){
        return {
            status : simulator.getStatus(),
            stats : simulator.getStats(),
            config : simulator.getConfig()
        };
    }

    function sendStats(ws,results){
        if (!results){
            results = getResult();
        }
        ws.send(JSON.stringify(results));
    }
});


