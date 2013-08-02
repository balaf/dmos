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
fsm.addHandler('logon',         'idle',         handler.startlogon,            'logon');
fsm.addHandler('logon',         'logon',        handler.sendInventoryChanges,  'logon-1');
fsm.addHandler('Overload',      'logon-1',      handler.handleOverload,        'logon-1');
fsm.addHandler('WriteItems',    'logon-1',      handler.handleWriteItems,      'logon-2');
fsm.addHandler('WriteItemsDone','logon-2',      handler.replyToWriteItems,     'logon-3');
fsm.addHandler('Overload',      'logon-3',      handler.handleOverload,        'logon-3');
fsm.addHandler('CleanUp',       'logon-3',      handler.handleCleanUp,         'logon-4');
fsm.addHandler('CleanUpDone',   'logon-4',      handler.sendStartUp,           'logon-5');
fsm.addHandler('Overload',      'logon-5',      handler.handleOverload,        'logon-5');
fsm.addHandler('CleanUp',       'logon-5',      handler.handleCleanUp,         'logon-6');
fsm.addHandler('CleanUpDone',   'logon-6',      handler.sendInventoryChanges,  'logon-7');
fsm.addHandler('Overload',      'logon-7',      handler.handleOverload,        'logon-7');
fsm.addHandler('CleanUp',       'logon-7',      handler.simFinished,           'idle');
fsm.addHandler('WriteItems',    'logon-7',      handler.handleWriteItems,      'logon-8');
fsm.addHandler('WriteItemsDone','logon-8',      handler.replyToWriteItems,     'logon-9');
fsm.addHandler('Overload',      'logon-9',      handler.handleOverload,        'logon-9');
fsm.addHandler('CleanUp',       'logon-9',      handler.simFinished,           'idle');

//// startUp
fsm.addHandler('startup',       'idle',         handler.startStartUp,          'startup-0');
fsm.addHandler('startup1',      'startup-0',    handler.sendStartUp,           'startup-1');

//1
fsm.addHandler('Overload',      'startup-1',    handler.handleOverload,        'startup-1');
fsm.addHandler('WriteItems',    'startup-1',    handler.handleWriteItems,      'startup-2');
fsm.addHandler('ReadItems',     'startup-1',    handler.handleReadItems,       'startup-4');
fsm.addHandler('ReadAllItems',  'startup-1',    handler.handleReadAllItems,    'startup-4');
fsm.addHandler('CleanUp',       'startup-1',    handler.handleCleanUp,         'startup-6');
//2
fsm.addHandler('WriteItemsDone','startup-2',    handler.replyToWriteItems,     'startup-3');
//3
fsm.addHandler('Overload',      'startup-3',    handler.handleOverload,        'startup-3');
fsm.addHandler('ReadItems',     'startup-3',    handler.handleReadItems,       'startup-4');
fsm.addHandler('ReadAllItems',  'startup-3',    handler.handleReadAllItems,    'startup-4');
fsm.addHandler('WriteItems',    'startup-3',    handler.handleWriteItems,      'startup-2');
fsm.addHandler('CleanUp',       'startup-3',    handler.handleCleanUp,         'startup-6');
//4
fsm.addHandler('ReadItemsDone', 'startup-4',    handler.handleReadItemsDone,   'startup-5');
fsm.addHandler('ReadAllItemsDone','startup-4',  handler.handleReadAllItemsDone,'startup-5');
//5
fsm.addHandler('Overload',      'startup-5',    handler.handleOverload,        'startup-5');
fsm.addHandler('WriteItems',    'startup-5',    handler.handleWriteItems,      'startup-2');
fsm.addHandler('CleanUp',       'startup-5',    handler.handleCleanUp,         'startup-6');
fsm.addHandler('ReadItems',     'startup-3',    handler.handleReadItems,       'startup-4');
fsm.addHandler('ReadAllItems',  'startup-3',    handler.handleReadAllItems,    'startup-4');
//6
fsm.addHandler('CleanUpDone',   'startup-6',    handler.simFinished,           'idle');



//// logoff
fsm.addHandler('logoff',         'idle',         handler.startlogoff,          'logoff');


module.exports.fsm = fsm;