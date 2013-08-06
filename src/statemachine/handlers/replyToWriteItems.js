'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;

var createMsg = require(__dirname + '/../../wpi/wpiObject').replyToWrite;
var wpiMsgTemplate = require( __dirname + '/../../wpi/wpiMessageTemplate');
var sendToDLS = require(__dirname + '/../../client/request');
var responseHandler = require(__dirname + '/../../client/response');

module.exports = function (device, nextState){
    fsmlog.info("Handler: replyToWriteItems starting for device %s", device.mac);

    var wpiMsg = wpiMsgTemplate(createMsg(device));

    if (device.wpiTimes[device.wpiTimes.length-1].status === "finished") {
        device.wpiTimes.push({start: new Date(), end: 0, status: "sent", type: "reply-to", overload: 0});
        device.count.sent++;
    }
    fsmlog.info("send ReplyTo: Done!");
    wpilog.info("%s : DLS <-- DEV: replyTo", device.mac);
    wpilog.info(wpiMsg);

    if (isRealSimulation) {
        sendToDLS(wpiMsg,device,function(res){
            fsmlog.info("send Reply-to: Done");
            device.state = nextState;
            fsmlog.info("New state for device %s is %s", device.mac, device.state);
            responseHandler(res,device);
        });
    } else {
        fsmlog.info("send Reply-to: Done");
        device.state = nextState;
        fsmlog.info("New state for device %s is %s", device.mac, device.state);
        var random = getRandomInt(1,3);
        fsmlog.debug("Random Number is:", random);
        if (random > 1) {
            setTimeout(function(){
                device.emit("CleanUp", "CleanUp", device);
            }, 2000);
        } else {
            setTimeout(function(){
                device.emit("Overload", "Overload", device);
                fsmlog.debug("Overlooooaaaaddddd");
            },2000)

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


