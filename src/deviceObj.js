'use strict';

var route = require(__dirname + '/statemachine');
var events = require("events");
var util = require('util');

/// The device Object prototype

function deviceObject (mac, e164, be164) {
    events.EventEmitter.call(this);
    this.mac = mac || "03:00:00:00:00:01";
    this.user = e164 ||  "302008010001";
    this.be164 = be164 || "802008010001";
    this.e164 = be164 || "802008010001";
    this.state = "idle";
    this.cookie = '';
    this.mobilityState = '1'; // logoff
    this.finished = false;
    this.duration = 0;
    this.startTime = 0;
    this.endTime = 0;
    this.wpiTimes = [];
    this.overloaded = 0;
    this.pass = "000000";
    this.count = { sent:0, finished:0, duration:0};
    this.firmware =  'V3 R1.41.1';
    this.deviceType = 'OpenStage 60';
    this.softwareType = 'Siemens SIP';

    init(this);
};

util.inherits(deviceObject,events.EventEmitter);

module.exports.deviceObject = deviceObject;

function init(obj){
    //// logon
    obj.on("logon", route);
    obj.on("logoff", route);
    obj.on("startup", route);
    obj.on("WriteItems", route);
    obj.on("WriteItemsDone", route);
    obj.on("ReadItems", route);
    obj.on("ReadItemsDone", route);
    obj.on("ReadAllItems", route);
    obj.on("ReadAllItemsDone", route);
    obj.on("CleanUp", route);
    obj.on("CleanUpDone", route);
    obj.on("Overload", route);
}