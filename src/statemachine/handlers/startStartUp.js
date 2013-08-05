'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;

module.exports = function (device, nextState){
    fsmlog.info("Handler: startStartup starting for device %s", device.mac);

    device.mobilityState = 1;
    device.e164 = device.be164;

    device.state = nextState;
    device.emit("startup", "startup", device);

}