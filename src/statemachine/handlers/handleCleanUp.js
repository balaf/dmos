'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;


module.exports = function (device, attr, nextState){
    fsmlog.info("Handler: handleCleanUp Starting for device %s", device.mac);
    device.wpiTimes[device.wpiTimes.length-1].end = new Date();

    setTimeout(function (){
        fsmlog.info("Handler: handleCleanUp: Done!!");
        device.emit("CleanUpDone", "CleanUpDone", device, {a:1} );
    }, 1000);

    device.state = nextState;
}
