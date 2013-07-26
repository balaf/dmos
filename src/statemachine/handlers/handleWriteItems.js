'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;


module.exports = function (device, attr, nextState){
    fsmlog.info("Handler: handleWriteItems starting for device %s ...", device.mac);


    setTimeout(function (){
        fsmlog.info("Handler: handleWriteItems: Done!!");
        device.emit("WriteItemsDone", "WriteItemsDone", device, {a:1} );
    },3000);

    device.state = nextState;
}