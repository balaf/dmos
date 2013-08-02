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

            wpilog.info("%s : DLS <-- DEV: Inventory changes", device.mac);
            wpilog.info(wpiMsg);
            if (device.wpiTimes.length > 0) {
                if (device.wpiTimes[device.wpiTimes.length-1].status === "finished") {
                    device.wpiTimes.push({start: new Date(), end: 0, status: "sent", type: "inventory-changes", overload: 0});
                }
            }

            sendToDLS(wpiMsg,device,function(res){
                fsmlog.info("sendInventoryChanges: Done");
                device.state = nextState;
                fsmlog.info("New state for device %s is %s", device.mac, device.state);
                responseHandler(res,device);

            }, function(error){
                //??? not sure what to do
                out.error('Unhandled Error');
            })
            break;
        case 'logon-6':
            var wpiMsg = wpiMsgTemplate(createMsg(device,2));

            /// send request goes here

            fsmlog.info("sendInventoryChanges: Done!");
            wpilog.info("%s : DLS <-- DEV: Inventory changes", device.mac);
            wpilog.info(wpiMsg);
            if (device.wpiTimes[device.wpiTimes.length-1].status === "finished") {
                device.wpiTimes.push({start: new Date(), end: 0, status: "sent", type: "inventory-changes", overload: 0});
            }


            sendToDLS(wpiMsg,device,function(res){
                fsmlog.info("sendInventoryChanges: Done");
                device.state = nextState;
                fsmlog.info("New state for device %s is %s", device.mac, device.state);
                responseHandler(res,device);

            })
            break;
    }
}
