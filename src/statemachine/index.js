'use strict';

var fsmlog = require(__dirname + '/../utils/logger').fsmlog;
var fsm = require(__dirname +'/fsm').fsm;


module.exports = function (event,obj,attr){
    var nextState;
    fsmlog.info ("Router received event: " + event + " for device: " + obj.id + " which is at state:" +obj.state);

    // check if this is a valid event for the given state
    if (fsm[event]){
        if (fsm[event][obj.state]){
            fsmlog.info(' Event is valid for this state');

            // trigger the action. After the action is completed, the device will go to the new state
            if (fsm[event][obj.state].next) {
                nextState = fsm[event][obj.state].next;
            } else  {
                fsmlog.warn ('No "next" state defined');
            }
            if (typeof (fsm[event][obj.state].handler === 'function')){
                var action = fsm[event][obj.state].handler;
                fsmlog.info("Routing the request...")
                action(obj, attr, nextState);
            } else {
                //  No handler function defined to handle event at this state
                defaultHandler(event,obj,attr);
            }
        }
        else {
            //  No handler function defined to handle event at this state
            defaultHandler(event,obj, attr);
        }
    } else {
        //  No handler function defined to handle event at this state
        defaultHandler(event,obj, attr);
    }
};

function defaultHandler(event,obj, attr) {
    fsmlog.warn ("Unexcpected Event: " + event + "  at state " + obj.state);
    fsmlog.warn ("Applying default handling...");
     var action = fsm.noevent.any.handler;
    action(obj,attr);
}