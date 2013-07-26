/**
 Initialize logger to be used by all modules
 usage:
 var logger = require('./logger.js').logger;
 var console = require('./logger.js').console;

 Levels:
 ALL
 TRACE
 DEBUG
 INFO
 WARN
 ERROR
 FATAL
 OFF
 **/

var appenders = require('./configurator.js').appenders;
var loglevels = require('./configurator.js').levels;

var log4js = require('log4js');
//log4js.configure(__dirname +'/../../conf/log4js.conf', {});

log4js.configure(appenders, {});

var logger = log4js.getLogger('default-log');
var console = log4js.getLogger('console');
var wpilog = log4js.getLogger('wpi');
var fsmlog = log4js.getLogger('fsm');

logger.setLevel(loglevels.default);
console.setLevel(loglevels.console);
wpilog.setLevel(loglevels.wpi);
fsmlog.setLevel(loglevels.fsm);

module.exports.logger = logger;
module.exports.console = console;
module.exports.wpilog = wpilog;
module.exports.fsmlog = fsmlog;