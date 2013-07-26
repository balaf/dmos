'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;


var sendInventoryChanges = require(__dirname +'/sendInventoryChanges');
var handleWriteItems = require(__dirname +'/handleWriteItems');
var replyToWriteItems = require(__dirname +'/replyToWriteItems');
var handleCleanUp = require(__dirname +'/handleCleanUp');
var sendStartUp = require(__dirname +'/sendStartUp');
var sendInventoryChangesII = require(__dirname +'/sendInventoryChangesII');
var logonFinished = require(__dirname +'/logonFinished');

function defaultHandler(){
    fsmlog.debug ("Default Handler Triggered");
}

module.exports = {
    sendInventoryChanges:sendInventoryChanges,
    handleWriteItems:handleWriteItems,
    replyToWriteItems:replyToWriteItems,
    handleCleanUp:handleCleanUp,
    sendStartUp:sendStartUp,
    sendInventoryChangesII:sendInventoryChangesII,
    logonFinished:logonFinished,
    defaultHandler:defaultHandler
};