'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;


module.exports = function (device, nextState){
    fsmlog.info("Handler: handleWriteItems starting for device %s ...", device.mac);
    device.wpiTimes[device.wpiTimes.length-1].end = new Date();
    device.wpiTimes[device.wpiTimes.length-1].duration = device.wpiTimes[device.wpiTimes.length-1].end - device.wpiTimes[device.wpiTimes.length-1].start;
    device.wpiTimes[device.wpiTimes.length-1].status = "finished";

    device.state = nextState;
    setTimeout(function (){
        fsmlog.info("Handler: handleWriteItems: Done!!");
        device.emit("WriteItemsDone", "WriteItemsDone", device);
    },3000);


}