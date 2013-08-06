'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;


module.exports = function (device, nextState){
    fsmlog.error("Handler: simFinished starting for device %s", device.mac);

    device.state = nextState;
    device.emit("simFinished", device);

}