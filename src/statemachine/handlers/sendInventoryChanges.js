'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;


module.exports = function (device, attr, nextState){
    fsmlog.info("Handler: sendInventoryChanges starting for device %s", device.mac);

    /// mock
    fsmlog.info("sendInventoryChanges: Done!");
    wpilog.info("%s : DLS <-- DEV: Inventory changes", device.mac);
    device.wpiTimes.push({start: new Date(), end: 0, status: "sent", type: "inventory-changes", overload: 0});


    device.state = nextState;
    fsmlog.info("sendInventoryChanges: New state for device %s is %s", device.mac, device.state);

    // mock writeItems reception
    if (getRandomInt(0,10) <= 10) {
        device.emit("WriteItems", "WriteItems", device, {a:1} );
        wpilog.info("%s : DLS --> DEV: Write Items", device.mac)
    } else {
        device.emit("Overload", "Overload", device, {a:1} );
    }

}


function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}