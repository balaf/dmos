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
//1
fsm.addHandler('Overload',      'logon-1',      handler.handleOverload,        'logon');
fsm.addHandler('WriteItems',    'logon-1',      handler.handleWriteItems,      'logon-2');
//2
fsm.addHandler('WriteItemsDone','logon-2',      handler.replyToWriteItems,     'logon-3');
//3
fsm.addHandler('Overload',      'logon-3',      handler.handleOverload,        'logon-2');
fsm.addHandler('CleanUp',       'logon-3',      handler.handleCleanUp,         'logon-4');
//4
fsm.addHandler('CleanUpDone',   'logon-4',      handler.sendStartUp,           'logon-5');
//5
fsm.addHandler('Overload',      'logon-5',      handler.handleOverload,        'logon-4');
fsm.addHandler('CleanUp',       'logon-5',      handler.handleCleanUp,         'logon-6');
//6
fsm.addHandler('CleanUpDone',   'logon-6',      handler.sendInventoryChanges,  'logon-7');
//7
fsm.addHandler('Overload',      'logon-7',      handler.handleOverload,        'logon-6');
fsm.addHandler('CleanUp',       'logon-7',      handler.simFinished,           'idle');
fsm.addHandler('WriteItems',    'logon-7',      handler.handleWriteItems,      'logon-8');
//8
fsm.addHandler('WriteItemsDone','logon-8',      handler.replyToWriteItems,     'logon-9');
//9
fsm.addHandler('Overload',      'logon-9',      handler.handleOverload,        'logon-8');
fsm.addHandler('CleanUp',       'logon-9',      handler.simFinished,           'idle');

//// startUp
fsm.addHandler('startup',       'idle',         handler.startStartUp,          'startup');
fsm.addHandler('startup',       'startup',      handler.sendStartUp,           'startup-1');

//1
fsm.addHandler('Overload',      'startup-1',    handler.handleOverload,        'startup');
fsm.addHandler('WriteItems',    'startup-1',    handler.handleWriteItems,      'startup-2');
fsm.addHandler('ReadItems',     'startup-1',    handler.handleReadItems,       'startup-4');
fsm.addHandler('ReadAllItems',  'startup-1',    handler.handleReadAllItems,    'startup-5');
fsm.addHandler('CleanUp',       'startup-1',    handler.handleCleanUp,         'startup-6');
//2
fsm.addHandler('WriteItemsDone','startup-2',    handler.replyToWriteItems,     'startup-3');
//3
fsm.addHandler('Overload',      'startup-3',    handler.handleOverload,        'startup-2');
fsm.addHandler('ReadItems',     'startup-3',    handler.handleReadItems,       'startup-4');
fsm.addHandler('ReadAllItems',  'startup-3',    handler.handleReadAllItems,    'startup-5');
fsm.addHandler('CleanUp',       'startup-3',    handler.handleCleanUp,         'startup-last');
//4
fsm.addHandler('ReadItemsDone', 'startup-4',    handler.handleReadItemsDone,   'startup-6');
//5
fsm.addHandler('ReadAllItemsDone','startup-5',  handler.handleReadAllItemsDone,'startup-7');
//6
fsm.addHandler('Overload',      'startup-6',    handler.handleOverload,        'startup-4');
fsm.addHandler('ReadAllItems',  'startup-6',    handler.handleReadAllItems,    'startup-5');
fsm.addHandler('CleanUp',       'startup-6',    handler.handleCleanUp,         'startup-last');
fsm.addHandler('WriteItems',    'startup-6',    handler.handleWriteItems,      'startup-2');
//7
fsm.addHandler('Overload',      'startup-7',    handler.handleOverload,        'startup-5');
fsm.addHandler('CleanUp',       'startup-7',    handler.handleCleanUp,         'startup-last');
fsm.addHandler('WriteItems',    'startup-7',    handler.handleWriteItems,      'startup-2');

fsm.addHandler('CleanUpDone',   'startup-last',    handler.simFinished,           'idle');



//// logoff
fsm.addHandler('logoff',         'idle',         handler.startlogoff,          'logoff');
fsm.addHandler('logoff',         'logoff',       handler.sendInventoryChanges, 'logoff-1');
//1
fsm.addHandler('Overload',      'logoff-1',    handler.handleOverload,         'logoff');
fsm.addHandler('ReadItems',     'logoff-1',    handler.handleReadItems,        'logoff-2');
//2
fsm.addHandler('ReadItemsDone', 'logoff-2',    handler.handleReadItemsDone,    'logoff-3');
//3
fsm.addHandler('Overload',      'logoff-3',    handler.handleOverload,         'logoff-2');
fsm.addHandler('CleanUp',       'logoff-3',    handler.handleCleanUp,          'logoff-4');
//4
fsm.addHandler('CleanUpDone',   'logoff-4',    handler.sendStartUp,            'logoff-5');
//5
fsm.addHandler('Overload',      'logoff-5',    handler.handleOverload,         'logoff-4');
fsm.addHandler('ReadAllItems',  'logoff-5',    handler.handleReadAllItems,     'logoff-6');
fsm.addHandler('CleanUp',       'logoff-5',    handler.handleCleanUp,          'logoff-8');
//6
fsm.addHandler('ReadAllItemsDone','logoff-6',    handler.handleReadAllItemsDone, 'logoff-7');
//7
fsm.addHandler('Overload',      'logoff-7',    handler.handleOverload,         'logoff-6');
fsm.addHandler('CleanUp',       'logoff-7',    handler.handleCleanUp,          'logoff-8');
//8
fsm.addHandler('CleanUpDone',   'logoff-7',    handler.simFinished,            'idle');


module.exports.fsm = fsm;