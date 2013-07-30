'use strict';

var simulation = require(__dirname + '/utils/configurator').simulation;
var statistics = require(__dirname + '/utils/stats')
var Device = require('./deviceObj').deviceObject;


var simStats = statistics.init;
var simConfig = {};

var simStatus = {
    status : "finished"
}

module.exports.init = function(){
    log.debug("Initializing Simulation Configuraiton");
    simConfig = {
        serverAddress : "10.1.3.4",
        mac : "03:00:00:00:00:00",
        be164 : 30210800000,
        e164 : 4021080000,
        action: 'logon',
        users: 10,
        targetRate: 1 //(users/sec)
    };

    simStatus = {
        status : "finished"
    }

    statistics.reset();
}

module.exports.start = function(config){
    out.info("Simulation started: ", simConfig.action);
    simStatus.status = "started";
    simConfig = config;
    /// Base values
    var baseValues = {
        mac : macToInt(simConfig.mac),
        be164 : simConfig.be164,
        e164 : simConfig.e164
    };

    var devices = initializeDevices(simConfig.users, baseValues);

    simStats.startTime = new Date();

    var interval = setInterval(startOne, 1000 / simConfig.targetRate);

    function startOne(){
        simStats.lastStarted = new Date();

        var currentDevice = devices[simStats.started];
        ///// Update Statistics for each new logon
        if (simStats.started === 0) {
            simStats.firstStarted = new Date();
        } else {
            simStats.lastStarted = new Date();
        }
        simStats.started ++;
        ///////////////////////
        currentDevice.startTime = new Date();
        currentDevice.emit(simConfig.action, simConfig.action, currentDevice);

        // stop starting new if all have started
        if (simStats.started === simConfig.users){
            /// All logons have started - stop starting new ones
            clearInterval(interval);
            simStatus.status = "allSent";
        }
    }

    function endOne(currentDevice){
        ////
        simStats.finished ++;
        if (simStats.finished === 1) {
            simStats.firstFinished = new Date();
            simStats.lastFinished = simStats.firstFinished;
        } else {
            simStats.lastFinished = new Date();
        }
        simStats.devices.push(currentDevice.wpiTimes);
        ////
        currentDevice.endTime = simStats.lastFinished;
        currentDevice.finished = true;

        if (simStats.finished === simConfig.users){
            out.info('All logons have finished successfully');
            simStatus.status = "finished";
        }
    }

/////////////  HELPER FUNCTIONS ////////////////

    function initializeDevices(num, baseValues){
        var dev = [];
        var mac;
        for (var i=0;i<num;i++){
            mac =  decToMac(i+baseValues.mac)
            dev[i] = new Device(mac, i+baseValues.e164, i+baseValues.be164);
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

    return interval;
};


module.exports.stop = function(interval){
    out.info("Simulation stopped: ", simConfig.action);
    clearInterval(interval);
    simStatus.status = "finished";
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

module.exports.setConfig = function (data) {
    var propt;
    for(propt in data){
        simConfig.propt = data.propt;
    }
};




