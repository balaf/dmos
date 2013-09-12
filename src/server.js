#!/usr/bin/env nodejs
'use strict';

// define global vaiable for logging
global.isRealSimulation = false;
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
            simulationID = simulator.start(JSONmessage.config);
            updateInterval = setInterval(report, 2000, ws);
        }
        if (JSONmessage.action === "stop"){
            // just stop sending new requests
            // the simulation will go to status "finished" when all queued request finish
            simulator.stop(simulationID);
        }
        if (JSONmessage.action === "config"){
            /// When a new configuraiton is received,
            /// do nothing.
            /// New configuraiton is only accepted as part of a 'start' request.
        }
        if (JSONmessage.action === "ping"){
            if (!checkEnd()) {
              out.info("Reconnecting client to the report stream");
              log.info("Reconnecting client to the report stream");
              updateInterval = setInterval(report, 2000, ws);
            }
        }
    });

    function report(ws){
        // every time a report is send back to the client
        // a check is made to see if the simulation has finished
        if (checkEnd()) {
            // if the simulation has finished, stop sending new reports
            clearInterval(updateInterval);
            sendStats(ws,getFinalResult());
        }
        else {
            sendStats(ws);
        }
    }

    function checkEnd (){

        var result = getResult();
        var end = false;
        if ((result.status.status === "finished") || (result.status.status === "ready")) {
            result = getFinalResult();
            out.info("Results:", result);
            log.info("Results:", result);
            end = true;
        } else if (result.stats.finished + result.stats.failed == result.config.users){
            simulator.setStatus("finished");
            end = true;
        }
        //out.debug("Status:", result.status.status)
        //out.debug("CheckEnd:  Started: %s, Finished %s, Failed: %s, Target: %s ",result.stats.started,result.stats.finished,result.stats.failed,result.config.users  )
        return end;
    }

    function getResult(){
        return {
            status : simulator.getStatus(),
            stats : simulator.getStats(),
            config : simulator.getConfig()
        };
    }

    function getFinalResult(){
        return {
            status : simulator.getStatus(),
            stats : simulator.getFinalStats(),
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


