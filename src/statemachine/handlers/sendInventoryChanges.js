'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;


module.exports = function (device, attr, nextState){
    fsmlog.info("Handler: sendInventoryChanges starting for device %s", device.id);


    fsmlog.info("sendInventoryChanges: Done!");
    device.state = nextState;
    fsmlog.info("sendInventoryChanges: New state for device %s is %s", device.id, device.state);

    // mock writeItems reception
    device.emit("WriteItems", "WriteItems", device, {a:1} );

}