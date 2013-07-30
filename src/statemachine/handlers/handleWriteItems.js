'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;


module.exports = function (device, attr, nextState){
    fsmlog.info("Handler: handleWriteItems starting for device %s ...", device.mac);
    device.wpiTimes[device.wpiTimes.length-1].end = new Date();

    setTimeout(function (){
        fsmlog.info("Handler: handleWriteItems: Done!!");
        device.emit("WriteItemsDone", "WriteItemsDone", device, {a:1} );
    },3000);

    device.state = nextState;
}