'use strict';

var createInvChanges =   require( __dirname + '/wpiObject').invChages;
var createStartUp =   require( __dirname + '/wpiObject').startUp;
var createReplyToWrite =   require( __dirname + '/wpiObject').replyToWrite;
var wpiMsgTemplate = require( __dirname + '/wpiMessageTemplate');

var Device = require(__dirname + '/../deviceObj').deviceObject;



var device = new Device()

var wpiMsg = createReplyToWrite(device);
var wpiMsg = createStartUp(device);
var wpiMsg = createInvChanges(device);


console.log(wpiMsg);


console.log(wpiMsgTemplate(wpiMsg));
