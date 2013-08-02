'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;

var createMsg = require(__dirname + '/../../wpi/wpiObject').startUp;
var wpiMsgTemplate = require( __dirname + '/../../wpi/wpiMessageTemplate');

module.exports = function (device, attr, nextState){
    fsmlog.info("Handler: sendStartUp starting for device %s", device.mac);

    device.mobilityState = 2;
    var wpiMsg = wpiMsgTemplate(createMsg(device));


    /// mock
    device.wpiTimes.push({start: new Date(), end: 0, status: "sent", type: "startUp", overload: 0});
    fsmlog.info("send StartUp: Done!");
    wpilog.info("%s : DLS <-- DEV: StartUp", device.mac);
    wpilog.info(wpiMsg);


    device.state = nextState;
    fsmlog.info("sendStartUp: New state for device %s is %s", device.mac, device.state);

    // mock cleanUp reception
    device.emit("CleanUp", "CleanUp", device, {a:1} );
    wpilog.info("%s :DLS --> DEV: CleanUp", device.mac);


}