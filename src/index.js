#!/usr/bin/env nodejs
'use strict';

// define global vaiable for logging
global.log = require(__dirname + '/utils/logger').logger;
global.out = require(__dirname + '/utils/logger').console;
global.wpilog = require(__dirname + '/utils/logger').wpilog;

var simulation = require(__dirname + '/utils/configurator').simulation;
var stats = require(__dirname + '/utils/stats');

var users = simulation.users;
var duration = simulation.duration;

users = 200;
duration = 10;

var targetArrivalRate = users/duration;

var interval = setInterval(startOne, 1000*duration/users);

function startOne() {
    //out.info("start One:",stats.started);
    if (stats.started === 0){
        stats.firstStarted = new Date();
    }
    if (stats.started === users-1){
        stats.lastStarted = new Date();
        clearInterval(interval);
    }
    stats.started ++;
    setTimeout(endOne,6000);
}

function endOne(){
    stats.finished ++;
    stats.lastFinished = new Date();
}


process.on('exit', function() {
    stats.print(targetArrivalRate,users);
});




