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
    this.e164 = this.be164;
    this.state = "idle";
    this.cookie = '';
    this.mobilityState = '1'; // logoff
    this.finished = false;
    this.duration = 0;
    this.startTime = 0;
    this.endTime = 0;

    init(this);
};

util.inherits(deviceObject,events.EventEmitter);

module.exports.deviceObject = deviceObject;

function init(obj){
    obj.on ("start",route);
    obj.on ("WriteItems",route);
    obj.on ("WriteItemsDone",route);
    obj.on ("CleanUp",route);
    obj.on ("CleanUpDone",route);
}