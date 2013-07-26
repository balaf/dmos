'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;


module.exports = function (device){
    fsmlog.info("Handler: replyToWriteItems starting for device %s", device.id);
}