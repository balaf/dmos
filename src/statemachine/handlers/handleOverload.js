'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;


module.exports = function (device, nextState){
    fsmlog.info("Handler: Overload starting for device %s", device.mac);
    device.wpiTimes[device.wpiTimes.length-1].overload++;
    var time = getRandomInt();
    fsmlog.info("Waiting for $s seconds....", time);

    setTimeout(function() {
        switch(device.state) {
            case 'logon-1': // overload received at the initial inv-changes
                fsmlog.info("re-send inv-changes: Done!");
                device.state = nextState;
                device.emit("logon", "logon", device);
                break;
            case 'logon-3':  // reply to
                fsmlog.info("re-send replyTo: Done!");
                device.state = nextState;
                device.emit("WriteItemsDone", "WriteItemsDone", device);
                break;
            case 'logon-5':  // startup
                fsmlog.info("re-send startUp: Done!");
                device.state = nextState;
                device.emit("CleanUpDone", "CleanUpDone", device);
                break;
            case 'logon-7':  // inv-changes
                fsmlog.info("re-send inv-changes2: Done!");
                device.state = nextState;
                device.emit("CleanUpDone", "CleanUpDone", device);
                break;
            case 'logon-9':  // reply to
                fsmlog.info("re-send replyTo: Done!");
                device.state = nextState;
                device.emit("WriteItemsDone", "WriteItemsDone", device);
                break;
            case 'startup-1':  // inv-changes
                fsmlog.info("re-send inv-changes: Done!");
                device.state = nextState;
                device.emit("startup", "startup", device);
                break;
            case 'startup-3':  // reply to
                fsmlog.info("re-send replyTo: Done!");
                device.state = nextState;
                device.emit("WriteItemsDone", "WriteItemsDone", device);
                break;
            case 'startup-6':  // reply to
                fsmlog.info("re-send replyTo: Done!");
                device.state = nextState;
                device.emit("ReadItemsDone", "ReadItemsDone", device);
                break;
            case 'startup-7':  // reply to
                fsmlog.info("re-send replyTo: Done!");
                device.state = nextState;
                device.emit("ReadAllItemsDone", "ReadAllItemsDone", device);
                break;
            case 'logoff-1':  // inv-changes
                fsmlog.info("re-send inv-changes: Done!");
                device.state = nextState;
                device.emit("logoff", "logoff", device);
                break;
            case 'logoff-3':  // reply tp
                fsmlog.info("re-send replyTo: Done!");
                device.state = nextState;
                device.emit("ReadItemsDone", "ReadItemsDone", device);
                break;
            case 'logoff-5':  // start up
                fsmlog.info("re-send start-up: Done!");
                device.state = nextState;
                device.emit("CleanUpDone", "CleanUpDone", device);
                break;
            case 'logoff-7':  // reply to
                fsmlog.info("re-send replyTo: Done!");
                device.state = nextState;
                device.emit("ReadAllItemsDone", "ReadAllItemsDone", device);
                break;
        }
    },time*1000);
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