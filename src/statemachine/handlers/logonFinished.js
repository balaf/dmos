'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;


module.exports = function (device){
    fsmlog.error("Handler: logonFinished starting for device %s", device.mac);
    device.wpiTimes[device.wpiTimes.length-1].end = new Date();
    device.emit("logonFinished", device);
}