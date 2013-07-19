#!/usr/bin/env nodejs

// define global vaiable for logging
global.log = require(__dirname + '/utils/logger').logger;
global.out = require(__dirname + '/utils/logger').console;
global.wpilog = require(__dirname + '/utils/logger').wpilog;

var stats = require(__dirname + '/utils/stats');

var USERS = 10;
var duration = 1;



var targetArrivalRate = USERS/duration;

var interval = setInterval(startOne, 1000*duration/USERS);

function startOne() {
    out.info("start One:",stats.started)
    if (stats.started == 0){
        stats.firstStarted = new Date();
    }
    if (stats.started == USERS-1){
        stats.lastStarted = new Date();
        clearInterval(interval);
    }
    stats.started ++;
    setTimeout(endOne,3000);
}

function endOne(){
    stats.finished ++;
    stats.lastFinished = new Date();
}


process.on('exit', function() {
    stats.print(targetArrivalRate,USERS);
});




