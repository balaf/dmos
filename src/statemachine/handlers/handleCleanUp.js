'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;


module.exports = function (device, nextState){
    fsmlog.info("Handler: handleCleanUp Starting for device %s", device.mac);
    device.wpiTimes[device.wpiTimes.length-1].end = new Date();
    device.wpiTimes[device.wpiTimes.length-1].duration = device.wpiTimes[device.wpiTimes.length-1].end - device.wpiTimes[device.wpiTimes.length-1].start;
    device.wpiTimes[device.wpiTimes.length-1].status = "finished";
    device.count.finished++;

    ;
    setTimeout(function (){
        fsmlog.info("Handler: handleCleanUp: Done!!");
        device.emit("CleanUpDone", "CleanUpDone", device);
    }, 1000);

    device.state = nextState;
}
