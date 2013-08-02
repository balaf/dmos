'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;

var createMsg = require(__dirname + '/../../wpi/wpiObject').replyToWrite;
var wpiMsgTemplate = require( __dirname + '/../../wpi/wpiMessageTemplate');
var sendToDLS = require(__dirname + '/../../client/request');
var responseHandler = require(__dirname + '/../../client/response');

module.exports = function (device, nextState){
    fsmlog.info("Handler: replyToWriteItems starting for device %s", device.mac);

    var wpiMsg = wpiMsgTemplate(createMsg(device));

    device.wpiTimes.push({start: new Date(), end: 0, status: "sent", type: "replyTo", overload: 0});
    fsmlog.info("send ReplyTo: Done!");
    wpilog.info("%s : DLS <-- DEV: replyTo", device.mac);
    wpilog.info(wpiMsg);


    sendToDLS(wpiMsg,device,function(res){
        fsmlog.info("sendInventoryChanges: Done");
        device.state = nextState;
        fsmlog.info("New state for device %s is %s", device.mac, device.state);
        responseHandler(res,device);

    }, function(error){
        //??? not sure what to do
        out.error('Unhandled Error');
    })
}


