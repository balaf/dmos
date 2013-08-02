'use strict';

var fsmlog = require(__dirname + '/../../utils/logger').fsmlog;


var sendInventoryChanges = require(__dirname +'/sendInventoryChanges');
var handleWriteItems = require(__dirname +'/handleWriteItems');
var replyToWriteItems = require(__dirname +'/replyToWriteItems');
var handleCleanUp = require(__dirname +'/handleCleanUp');
var sendStartUp = require(__dirname +'/sendStartUp');
var simFinished = require(__dirname +'/simFinished');
var handleOverload = require(__dirname +'/handleOverload');
var startlogon = require(__dirname +'/startlogon');
var startStartUp = require( __dirname + '/startStartUp');
var startlogoff = require( __dirname + '/startlogoff');
var handleReadItems = require (__dirname + '/handleReadItems');
var handleReadAllItems = require (__dirname + '/handleReadAllItems');
var handleReadItemsDone = require (__dirname + '/handleReadItemsDone');
var handleReadAllItemsDone = require (__dirname + '/handleReadAllItemsDone');

function defaultHandler(){
    fsmlog.debug ("Default Handler Triggered");
}

module.exports = {
    sendInventoryChanges:sendInventoryChanges,
    handleWriteItems:handleWriteItems,
    replyToWriteItems:replyToWriteItems,
    handleCleanUp:handleCleanUp,
    sendStartUp:sendStartUp,
    simFinished:simFinished,
    defaultHandler:defaultHandler,
    handleOverload:handleOverload,
    startlogon:startlogon,
    startStartUp:startStartUp,
    startlogoff:startlogoff,
    handleReadItems:handleReadItems,
    handleReadAllItems:handleReadAllItems,
    handleReadItemsDone:handleReadItemsDone,
    handleReadAllItemsDone:handleReadAllItemsDone
};