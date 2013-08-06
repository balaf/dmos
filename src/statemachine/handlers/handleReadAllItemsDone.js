'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;

var createMsg = require(__dirname + '/../../wpi/wpiObject').replyToReadAll;
var wpiMsgTemplate = require( __dirname + '/../../wpi/wpiMessageTemplate');
var sendToDLS = require(__dirname + '/../../client/request');
var responseHandler = require(__dirname + '/../../client/response');

module.exports = function (device, nextState){
    fsmlog.info("Handler: replyToReadAll starting for device %s", device.mac);

    var wpiMsg = wpiMsgTemplate(createMsg(device));

    /// send the message
    wpilog.info("%s : DLS <-- DEV: reply-to", device.mac);
    wpilog.info(wpiMsg);
    if (device.wpiTimes.length > 0) {
        if (device.wpiTimes[device.wpiTimes.length-1].status === "finished") {
            device.wpiTimes.push({start: new Date(), end: 0, status: "sent", type: "reply-to", overload: 0});
            device.count.sent++;
        }
    } else {
        device.wpiTimes.push({start: new Date(), end: 0, status: "sent", type: "reply-to", overload: 0});
        device.count.sent++;
    }

    if (isRealSimulation) {
        sendToDLS(wpiMsg,device,function(res){
            fsmlog.info("sendReplyTo ReadAll : Done");
            device.state = nextState;
            fsmlog.info("New state for device %s is %s", device.mac, device.state);
            responseHandler(res,device);
        });
    } else {
        fsmlog.info("sendReplyTo All: Done");
        device.state = nextState;
        fsmlog.info("New state for device %s is %s", device.mac, device.state);
        var random = getRandomInt(1,3);
        if (random < 2.1) {
            device.emit("CleanUp", "CleanUp", device);
        } else {
            device.emit("Overload", "Overload", device);
            fsmlog.info("Overlooooaaaaddddd");
        }
    }
}

function getRandomInt (min, max) {
    if (!max) {
        max = 60;
    }
    if (!min) {
        min = 20;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

