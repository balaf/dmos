'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;

var createMsg = require(__dirname + '/../../wpi/wpiObject').startUp;
var wpiMsgTemplate = require( __dirname + '/../../wpi/wpiMessageTemplate');
var sendToDLS = require(__dirname + '/../../client/request');
var responseHandler = require(__dirname + '/../../client/response');

module.exports = function (device, nextState){
    fsmlog.info("Handler: sendStartUp starting for device %s", device.mac);

    switch (device.state){
        case 'logon-4':
            device.mobilityState = 2;
            var wpiMsg = wpiMsgTemplate(createMsg(device));
            break;
        case 'startup':
            var wpiMsg = wpiMsgTemplate(createMsg(device));
            break;
    }

    if (device.wpiTimes.length > 0) {
        if (device.wpiTimes[device.wpiTimes.length-1].status === "finished") {
            device.wpiTimes.push({start: new Date(), end: 0, status: "sent", type: "inventory-changes", overload: 0});
        }
    }
    fsmlog.info("send StartUp: Done!");
    wpilog.info("%s : DLS <-- DEV: StartUp", device.mac);
    wpilog.info(wpiMsg);


    sendToDLS(wpiMsg,device,function(res){
        fsmlog.info("sendStartUp: Done");
        device.state = nextState;
        fsmlog.info("New state for device %s is %s", device.mac, device.state);
        responseHandler(res,device);

    })
}