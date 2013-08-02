'use strict';

var wpiParser = require( __dirname + '/../wpi/wpiParser');

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function response(res,device) {
    //// response handling goes here
    log.info("Response from DLS received");

    var responseText = "";
    // Update Cookie
    if (res.headers['set-cookie'])
        device.cookie = res.headers['set-cookie'][0].split(';')[0];

    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        if (chunk)
            responseText += chunk;
    });

    res.on('end', function (chunk) {
        if (chunk) {
            responseText += chunk;
        }

        wpiParser(responseText,function(wpiObj){
            out.debug('Reply from Server:',wpiObj);
            if (!wpiObj.isWPI) {
                out.error("Response from DLS is not recognized as a WPI message")
            } else {
                wpilog.info("%s : DLS --> DEV: %s", device.mac, wpiObj.rfc)
                wpilog.info(responseText);
                switch (wpiObj.rfc){
                    case 'CleanUp':
                        if (wpiObj.itemList) {
                            if (wpiObj.itemList['cleanup-reason'] === "overload") {
                                device.emit("Overload", "Overload", device);
                            }
                        }
                        break;
                    default:
                        device.emit(wpiObj.rfc, wpiObj.rfc, device);
                        break;
                }
            }

        });
    });

}

module.exports = response;