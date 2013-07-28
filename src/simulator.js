'use strict';

// define global vaiable for logging
global.log = require(__dirname + '/utils/logger').logger;
global.out = require(__dirname + '/utils/logger').console;
global.wpilog = require(__dirname + '/utils/logger').wpilog;

var simulation = require(__dirname + '/utils/configurator').simulation;
var simStats = require(__dirname + '/utils/stats');
var Device = require('./deviceObj').deviceObject;

var simConfig = {
    serverAddress : "10.1.3.4",
    mac : "03:00:00:00:00:00",
    be164 : 30210800000,
    e164 : 4021080000,
    action: 'logon',
    users: 10,
    targetRate: 6 //(users/sec)
};

var simTime = {};

var simStatus = {
    status : "finished"
}



module.exports.start = function(config){

    simStatus.status = "started";
    simConfig = config;
    /// Base values
    var baseValues = {
        mac : macToInt(simConfig.mac),
        be164 : simConfig.be164,
        e164 : simConfig.e164
    };

    var devices = initializeDevices(simConfig.users, baseValues);

    console.log("Started with SimConfig:", JSON.stringify(simConfig));
    simTime.startTime = new Date();

    var interval = setInterval(startOne, 1000 / simConfig.targetRate);

    function startOne(){
        simTime.lastStarted = new Date();

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
        currentDevice.emit('start','start', currentDevice);

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
        simStats.lastFinished = new Date();
        ////
        currentDevice.endTime = simStats.lastFinished;
        currentDevice.finished = true;

        if (simStats.finished === simConfig.users){
            console.log('All logons have finished successfully');
            simStatus.status = "finished";
            simStats.print(simConfig.targetRate,simConfig.users);
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
    clearInterval(interval);
    simStatus.status = "finished";
};


module.exports.getTime = function () {
    return simTime;
};

module.exports.getStats = function () {
    return simStats;
};

module.exports.getConfig = function () {
    return simConfig;
};

module.exports.getStatus = function () {
    return simStatus;
};



