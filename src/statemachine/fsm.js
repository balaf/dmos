'use strict';

var handler = require(__dirname +'/handlers');

var fsmProto = function () { };


fsmProto.prototype.addHandler = function (event,state,handler,next) {
    if(!this[event]) {
        this[event] = {};
    }
    if (!this[event][state]) {
        this[event][state] = {};
    }
    this[event][state].handler = handler;
    if (next) {
        this[event][state].next = next;
    }
};

var fsm = new fsmProto();
/////////////// Event           STATE          HANDLER                     NEXT STATE
fsm.addHandler('noevent',       'any',         handler.defaultHandler);

// logon flow
// DEV --> DLS    inventory-changes
// DEV <-- DLS    Write Items
// DEV --> DLS    reply-to
// DEV <-- DLS    Clean-up
// DEV --> DLS    start-up
// DEV <-- DLS    Clean-up
// DEV --> DLS    inventory-changes (userdata)
    // DEV <-- DLS    write-items
    // DEV --> DLS    reply-to
// DEV <-- DLS    Clean-up

//// logon
/////////////// Event            STATE          HANDLER                        NEXT STATE
fsm.addHandler('logon',         'idle',         handler.sendInventoryChanges,  'logon-1');
fsm.addHandler('Overload',      'logon-1',      handler.handleOverload,        'logon-1');
fsm.addHandler('WriteItems',    'logon-1',      handler.handleWriteItems,      'logon-2');
fsm.addHandler('WriteItemsDone','logon-2',      handler.replyToWriteItems,     'logon-3');
fsm.addHandler('Overload',      'logon-3',      handler.handleOverload,        'logon-3');
fsm.addHandler('CleanUp',       'logon-3',      handler.handleCleanUp,         'logon-4');
fsm.addHandler('CleanUpDone',   'logon-4',      handler.sendStartUp,           'logon-5');
fsm.addHandler('Overload',      'logon-5',      handler.handleOverload,        'logon-5');
fsm.addHandler('CleanUp',       'logon-5',      handler.handleCleanUp,         'logon-6');
fsm.addHandler('CleanUpDone',   'logon-6',      handler.sendInventoryChangesII,'logon-7');
fsm.addHandler('Overload',      'logon-7',      handler.handleOverload,        'logon-7');
fsm.addHandler('CleanUp',       'logon-7',      handler.logonFinished,         'idle');
fsm.addHandler('WriteItems',    'logon-7',      handler.handleWriteItems,      'logon-8');
fsm.addHandler('WriteItemsDone','logon-8',      handler.replyToWriteItems,     'logon-9');
fsm.addHandler('Overload',      'logon-9',      handler.handleOverload,        'logon-9');
fsm.addHandler('CleanUp',       'logon-9',      handler.logonFinished,         'idle');

module.exports.fsm = fsm;