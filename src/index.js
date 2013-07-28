'use strict';

// define global vaiable for logging
global.log = require(__dirname + '/utils/logger').logger;
global.out = require(__dirname + '/utils/logger').console;
global.wpilog = require(__dirname + '/utils/logger').wpilog;

var simulation = require(__dirname + '/utils/configurator').simulation;
var stats = require(__dirname + '/utils/stats');
var Device = require('./deviceObj').deviceObject;

var users = simulation.users;
var duration = simulation.duration;

users = 30;
duration = 10;

/// Base values
var baseMac = macToInt(simulation.mac);
var baseBE164 = simulation.be164;
var baseE164 = simulation.e164;
var devices = initializeDevices(users);


var targetArrivalRate = users/duration;

var interval = setInterval(startOne, 1000*duration/users);
/// periodically print results to stdout
var printInterval = setInterval(printer,10000);

function startOne() {

    var currentDevice = devices[stats.started];
    ///// Update Statistics for each new logon
    if (stats.started === 0){
        stats.firstStarted = new Date();
    } else {
        stats.lastStarted = new Date();
    }
    stats.started ++;
    ///////////////////////
    currentDevice.startTime = new Date();
    currentDevice.emit('start','start', currentDevice);

    // stop starting new if all have started
    if (stats.started === users){
        console.log('---- All started! ----')
        clearInterval(interval);
    }
}

function endOne(currentDevice){
    ////
    stats.finished ++;
    stats.lastFinished = new Date();
    ////
    currentDevice.endTime = stats.lastFinished;
    currentDevice.finished = true;

    if (stats.finished===users){
        console.log('All logons have finished successfully');
        clearInterval(printInterval);
    }
}

process.on('exit', function (){
    console.log('---- End of Simulation -----');
    stats.print(targetArrivalRate,users);
    printStats();
})


/////////////  HELPER FUNCTIONS ////////////////
var lastfinished= 0;
function printer(){
    if ((stats.started === users) && (stats.finished === lastfinished)) {
        /// no new finished since last time
        console.log("All logons have started, and no new finished logons in the last 10 seconds");
        console.log("Stopping simulation....");
        clearInterval(printInterval)
    } else {
        lastfinished = stats.finished;
        stats.print(targetArrivalRate,users);
    }
}

function printStats(){
    /// calculate min/max/mean
    var min = 100000;   //(sec)
    var max = 0;  //(sec)
    var mean;
    var variance = 0;
    var i;
    var currentDevice;

    var totalDuration = 0;
    var finishedDevices = 0;

    for (i=0;i<devices.length;i++) {
        currentDevice = devices[i];
        if  (currentDevice.finished) {
            finishedDevices ++;
            currentDevice.duration = currentDevice.endTime - currentDevice.startTime;
            if (currentDevice.duration < min) {
                min = currentDevice.duration;
            }
            if (currentDevice.duration > max) {
                max = currentDevice.duration;
            }
            totalDuration += currentDevice.duration;
        }
    }
    mean = (totalDuration/finishedDevices);

    for (i=0;i<finishedDevices;i++){
        variance += Math.pow((currentDevice.duration - mean),2)
    }
    variance = Math.sqrt(variance * (1/(finishedDevices+1))/1000);
    min = Math.round(min/10)/100;
    max = Math.round(max/10)/100;
    mean = Math.round(mean/10)/100;
    variance = Math.round(variance*1000)/1000;

    console.log('--- Statistics ----');
    console.log("Min logon Time (sec): ", min);
    console.log("Max logon Time (sec): ", max);
    console.log("Mean logon Time (sec): ", mean);
    console.log("Variance (sec): ", variance);
    console.log("\n\n");
}

function initializeDevices(num){
    var dev = [];
    var mac;
    for (var i=0;i<num;i++){
        mac =  decToMac(baseMac+i)
        dev[i] = new Device(mac, baseE164+i, baseBE164+i);
        dev[i].on("logonFinished", endOne)
    }

    return dev;
}

function isEven(value){
    if (value%2 == 0)
        return true;
    else
        return false;
}

function decToMac(d){
    var mac="";
    var hex = Number(d).toString(16);
    if (!isEven(hex.length))
        hex = "0" + hex;
    hex = hex.toUpperCase();
    for (var i=0;i<hex.length;i+=2){
        if (i+2 < hex.length)
            mac += hex.substring(i,i+2) + ":";
        else
            mac += hex.substring(i,i+2)
    }
    return mac;
}

function macToInt (mac) {
    return parseInt(parseInt(mac.replace(/:/g,"")),16)
}





