'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;

module.exports = function (device, nextState){
    fsmlog.info("Handler: startlogon starting for device %s", device.mac);

    device.mobilityState = 0;
    device.e164 = device.user;

    device.state = nextState;
    device.emit("logon", "logon", device);

}