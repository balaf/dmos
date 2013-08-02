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
                wpilog.info("%s : DLS <-- DEV: replyTo", device.mac);


                // mock writeItems reception
                device.state = nextState;
                device.emit("WriteItems", "WriteItems", device);
                wpilog.info("%s : DLS --> DEV: Write Items", device.mac);

                break;
            case 'logon-3':  // reply to
                fsmlog.info("re-send replyTo: Done!");
                wpilog.info("%s : DLS <-- DEV: replyTo", device.mac);

                // mock CleanUp reception
                device.state = nextState;
                device.emit("CleanUp", "CleanUp", device);
                wpilog.info("%s :DLS --> DEV: CleanUp", device.mac);

                break;
            case 'logon-5':  // startup
                fsmlog.info("re-send startUp: Done!");
                wpilog.info("%s : DLS <-- DEV: replyTo", device.mac);

                // mock writeItems reception
                device.state = nextState;
                device.emit("CleanUp", "CleanUp", device);
                wpilog.info("%s :DLS --> DEV: CleanUp", device.mac);
                break;
            case 'logon-7':  // inv-changes
                fsmlog.info("re-send inv-changes2: Done!");
                wpilog.info("%s : DLS <-- DEV: replyTo", device.mac);

                // mock writeItems reception         but may be a cleanup (or overload)
                device.state = nextState;
                device.emit("WriteItems", "WriteItems", device);
                wpilog.info("%s : DLS --> DEV: Write Items", device.mac);
                break;
            case 'logon-9':  // reply to
                fsmlog.info("re-send replyTo: Done!");
                wpilog.info("%s : DLS <-- DEV: replyTo", device.mac);

                // mock CleanUp reception
                device.state = nextState;
                device.emit("CleanUp", "CleanUp", device);
                wpilog.info("%s :DLS --> DEV: CleanUp", device.mac);
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