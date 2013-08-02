'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;

module.exports = function (device, nextState){
    fsmlog.info("Handler: startStartup starting for device %s", device.mac);

    device.mobilityState = 1;
    device.e164 = device.be164;


    out.debug("Next Stateeee", nextState);

    out.debug("beee Stateeee");


    //device.state = "startup-0";//nextState;

   // device.emit("startup", "startup", device);

}