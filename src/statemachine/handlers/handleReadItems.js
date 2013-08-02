'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;


module.exports = function (device, nextState){
    fsmlog.info("Handler: handleReadtems starting for device %s ...", device.mac);
    device.wpiTimes[device.wpiTimes.length-1].end = new Date();
    device.wpiTimes[device.wpiTimes.length-1].duration = device.wpiTimes[device.wpiTimes.length-1].end - device.wpiTimes[device.wpiTimes.length-1].start;
    device.wpiTimes[device.wpiTimes.length-1].status = "finished";

    setTimeout(function (){
        fsmlog.info("Handler: handleReadItems: Done!!");
        device.emit("ReadItemsDone", "ReadItemsDone", device);
    },3000);

    device.state = nextState;
}