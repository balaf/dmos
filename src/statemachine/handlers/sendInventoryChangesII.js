'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;


module.exports = function (device){
    fsmlog.info("Handler: sendInventoryChangesII starting for device %s", device.id);
    device.state = "logon-1"
}