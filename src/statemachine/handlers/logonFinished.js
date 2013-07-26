'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;


module.exports = function (device){
    fsmlog.error("Handler: logonFinished starting for device %s", device.mac);
    device.emit("logonFinished", device);
}