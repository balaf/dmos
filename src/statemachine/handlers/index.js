'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;


var sendInventoryChanges = require(__dirname +'/sendInventoryChanges');
var handleWriteItems = require(__dirname +'/handleWriteItems');
var replyToWriteItems = require(__dirname +'/replyToWriteItems');
var handleCleanUp = require(__dirname +'/handleCleanUp');
var sendStartUp = require(__dirname +'/sendStartUp');
var logonFinished = require(__dirname +'/logonFinished');
var handleOverload = require(__dirname +'/handleOverload');
var startlogon = require(__dirname +'/startlogon');

function defaultHandler(){
    fsmlog.debug ("Default Handler Triggered");
}

module.exports = {
    sendInventoryChanges:sendInventoryChanges,
    handleWriteItems:handleWriteItems,
    replyToWriteItems:replyToWriteItems,
    handleCleanUp:handleCleanUp,
    sendStartUp:sendStartUp,
    logonFinished:logonFinished,
    defaultHandler:defaultHandler,
    handleOverload:handleOverload,
    startlogon:startlogon,
};