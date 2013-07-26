'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;


module.exports = function (device, attr, nextState){
    fsmlog.info("Handler: sendInventoryChanges starting for device %s", device.mac);

    /// mock
    fsmlog.info("sendInventoryChanges: Done!");
    wpilog.info("%s : DLS <-- DEV: Inventory changes", device.mac);


    device.state = nextState;
    fsmlog.info("sendInventoryChanges: New state for device %s is %s", device.mac, device.state);

    // mock writeItems reception
    device.emit("WriteItems", "WriteItems", device, {a:1} );
    wpilog.info("%s : DLS --> DEV: Write Items", device.mac);
}