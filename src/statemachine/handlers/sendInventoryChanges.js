'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;

var createMsg = require(__dirname + '/../../wpi/wpiObject').invChages;
var wpiMsgTemplate = require( __dirname + '/../../wpi/wpiMessageTemplate');
var sendToDLS = require(__dirname + '/../../client/request');
var responseHandler = require(__dirname + '/../../client/response');

module.exports = function (device, nextState){
    fsmlog.info("Handler: sendInventoryChanges starting for device %s", device.mac);
    switch(device.state) {
        case 'logon':
            var wpiMsg = wpiMsgTemplate(createMsg(device,1));
            break;
        case 'logon-6':
            device.mobilityState = 0;
            var wpiMsg = wpiMsgTemplate(createMsg(device,2));
            break;
        case 'logoff':
            var wpiMsg = wpiMsgTemplate(createMsg(device,3));
            break;
    }

    /// send the message
    wpilog.info("%s : DLS <-- DEV: Inventory changes", device.mac);
    wpilog.info(wpiMsg);
    if (device.wpiTimes.length > 0) {
        if (device.wpiTimes[device.wpiTimes.length-1].status === "finished") {
            device.wpiTimes.push({start: new Date(), end: 0, status: "sent", type: "inventory-changes", overload: 0});
            device.count.sent++;
        }
    } else {
        device.wpiTimes.push({start: new Date(), end: 0, status: "sent", type: "inventory-changes", overload: 0});
        device.count.sent++;
    }

    if (isRealSimulation) {
        sendToDLS(wpiMsg,device,function(res){
            fsmlog.info("sendInventoryChanges: Done");
            device.state = nextState;
            fsmlog.info("New state for device %s is %s", device.mac, device.state);
            responseHandler(res,device);
        })
    } else {
        device.state = nextState;
        var random = getRandomInt(1,3);
        switch(device.state) {
            case 'logon-1':
                if (random < 1.1) {
                    device.emit("WriteItems", "WriteItems", device);
                } else {
                    device.emit("Overload", "Overload", device);
                    fsmlog.info("Overlooooaaaaddddd");
                }
                break;
            case 'logon-7':
                if (random < 1.1) {
                    device.emit("WriteItems", "WriteItems", device);
                } else if (random < 2.1) {
                    device.emit("CleanUp", "CleanUp", device);
                } else {
                    device.emit("Overload", "Overload", device);
                    fsmlog.info("Overlooooaaaaddddd");
                }
                break;
            case 'logoff-1':
                if (random < 2.1) {
                    device.emit("ReadItems", "ReadItems", device);
                } else {
                    device.emit("Overload", "Overload", device);
                    fsmlog.info("Overlooooaaaaddddd");
                }
                break;
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