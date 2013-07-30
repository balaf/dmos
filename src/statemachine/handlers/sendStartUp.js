'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;


module.exports = function (device, attr, nextState){
    fsmlog.info("Handler: sendStartUp starting for device %s", device.mac);

    /// mock
    device.wpiTimes.push({start: new Date(), end: 0});
    fsmlog.info("send StartUp: Done!");
    wpilog.info("%s : DLS <-- DEV: StartUp", device.mac);


    device.state = nextState;
    fsmlog.info("sendStartUp: New state for device %s is %s", device.mac, device.state);

    // mock writeItems reception
    device.emit("CleanUp", "CleanUp", device, {a:1} );
    wpilog.info("%s :DLS --> DEV: CleanUp", device.mac);


}