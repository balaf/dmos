'use strict';

var simulation = require(__dirname + '/utils/configurator').simulation;
var statistics = require(__dirname + '/utils/stats');
var Device = require('./deviceObj').deviceObject;

var simStats = statistics.init;
var simConfig = {};

var simStatus = {
    status : "ready"
}

module.exports.start = function(config){
    // initialize configuration
    simConfig = config;
    statistics.reset();
    out.info("Simulation started: ", simConfig);
    log.info("Simulation started: ", simConfig);

    /// start
    simStatus.status = "started";

    /// Base values
    var baseValues = {
        mac : macToInt(simConfig.mac),
        be164 : simConfig.be164,
        e164 : simConfig.e164
    };

    var devices = initializeDevices(simConfig.users, baseValues);
    out.info("Initializing %s devices", devices.length);
    log.info("Initializing %s devices", devices.length);

    simStats.startTime = new Date();

    var interval = setInterval(startOne, 1000 / simConfig.targetRate);
    out.info("Interval Duration (msec):", 1000 / simConfig.targetRate);
    log.info("Interval Duration (msec):", 1000 / simConfig.targetRate);

    function startOne() {
        ///// Update Statistics for each new logon
        var timeNow = new Date();
        if (simStats.started === 0) {
            simStats.firstStarted = timeNow;
        }
        simStats.lastStarted = timeNow;
        var currentDevice = devices[simStats.started];
        currentDevice.startTime = timeNow;
        log.debug("Emit %s for device %s", simConfig.action, currentDevice.mac)

        simStats.devices[currentDevice.mac] = {};
        simStats.devices[currentDevice.mac].startTime = timeNow;
        simStats.devices[currentDevice.mac].overloaded = 0;
        simStats.devices[currentDevice.mac].progress = "started";
        simStats.devices[currentDevice.mac].wpiTimes = currentDevice.wpiTimes;;
        simStats.devices[currentDevice.mac].count = currentDevice.count;

        ///////////////////////
        simStats.started ++;
        currentDevice.emit(simConfig.action, simConfig.action, currentDevice);
        // stop starting new if all have started
        // note: simConfig.users is a string
        //       simStats.started is a number
        if (simStats.started == simConfig.users){
            /// All logons have started - stop starting new ones
            clearInterval(interval);
            simStatus.status = "allSent";
        }
    }

    function endOne(currentDevice){
        ////
        var timeNow = new Date();
        simStats.finished ++;
        if (simStats.finished === 1) {
            simStats.firstFinished = timeNow
            simStats.lastFinished = simStats.firstFinished;
        } else {
            simStats.lastFinished = timeNow;
        }
       // simStats.devices.push(currentDevice.wpiTimes);
        ////
        currentDevice.endTime = simStats.lastFinished;
        currentDevice.finished = true;

        simStats.devices[currentDevice.mac].endTime = timeNow;
        simStats.devices[currentDevice.mac].progress = "finished";
        //simStats.devices[currentDevice.mac].duration = timeNow - simStats.devices[currentDevice.mac].startTime;

        if (simStats.finished + simStats.failed == simConfig.users) {
            out.info('All started requests have finished successfully');
            log.info('All started requests have finished successfully');
            log.info('Started:', simConfig.users);
            log.info('Finished Successfully:', simStats.finished);
            log.info('Failed:', simStats.failed);
            log.info('End of the simulation');

            simStatus.status = "finished";
            log.info("Change status to: ", simStatus.status);
        }
    }

/////////////  HELPER FUNCTIONS ////////////////

    function initializeDevices(num, baseValues){
        var dev = [];
        var mac;
        for (var i=0;i<num;i++){
            mac =  decToMac(i+baseValues.mac)
            dev[i] = new Device(mac, i+baseValues.e164, i+baseValues.be164);
            dev[i].on("simFinished", endOne);
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

    return interval;
};

module.exports.setStatus = function(status) {
    simStatus.status = status;
};

module.exports.setStats = function(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            simStats.key = obj.key;
        }
    }
};

module.exports.stop = function(interval){
    out.info("Simulation stopped: ", simConfig.action);
    log.info("Simulation stopped: ", simConfig.action);
    clearInterval(interval);
    simConfig.users = simStats.started;
    simStatus.status = "stopped";
    log.info("Change status to: ", simStatus.status);
};

module.exports.getStats = function () {
    simStats.now = new Date();
    return simStats;
};

module.exports.getConfig = function () {
    return simConfig;
};

module.exports.getStatus = function () {
    return simStatus;
};

module.exports.getFinalStats = function () {
    statistics.updateOnFinish(simStats);
    simStats.now = new Date();
    return simStats;
};

module.exports.setConfig = function (data) {
    var propt;
    for(propt in data){
        simConfig.propt = data.propt;
    }
};

module.exports.setFailed = function(){
    simStats.failed++;
    out.info("Failed:", simStats.failed)
};

module.exports.setOverloaded = function(mac){
    if (simStats.devices[mac].overloaded == 0){
        simStats.overloaded++;
        simStats.devices[mac].overloaded = 1;
    };
};

module.exports.getSimConfig = function() {
    return simConfig;
};