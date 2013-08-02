'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;

var createMsg = require(__dirname + '/../../wpi/wpiObject').replyToWrite;
var wpiMsgTemplate = require( __dirname + '/../../wpi/wpiMessageTemplate');

module.exports = function (device, attr, nextState){
    fsmlog.info("Handler: replyToWriteItems starting for device %s", device.mac);

    var wpiMsg = wpiMsgTemplate(createMsg(device));
    /// send request goes here

    ////////////////////////

    /// mock
    device.wpiTimes.push({start: new Date(), end: 0, status: "sent", type: "replyTo", overload: 0});
    fsmlog.info("send ReplyTo: Done!");
    wpilog.info("%s : DLS <-- DEV: replyTo", device.mac);
    wpilog.info(wpiMsg);



    device.state = nextState;
    fsmlog.info("sendInventoryChanges: New state for device %s is %s", device.mac, device.state);

    // mock CleanUp reception
    device.emit("CleanUp", "CleanUp", device, {a:1} );
    wpilog.info("%s :DLS --> DEV: CleanUp", device.mac);
}


