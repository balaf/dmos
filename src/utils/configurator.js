'use strict';

var nconf = require('nconf');

//
// Setup nconf to use (in-order):
//   1. Command-line arguments
//   2. Environment variables
//   3. A file located at 'path/to/config.json'
//
nconf.file({ file: __dirname + '../conf/dmos.conf' });


// In case a configuration file is missing
// OR the parameters are not set in the configuration file,
// use the following defaults
// The default values are overwritten by the configuraiton file

nconf.defaults({
    simulation: {
        "users": 10,
        "duration": 2
    },
    logging: {
        "loglevels": {
            "default": "ALL",
            "console": "ALL",
            "wpi":" ALL"
        },
        logappenders:{
           "appenders": [
                {
                    "type": "file",
                    "absolute": true,
                    "filename": "../log/dmos.log",
                    "maxLogSize": 20480,
                    "backups": 3,
                    "category": "default-log"
                },
                {
                    "type": "file",
                    "absolute": true,
                    "filename": "../log/wpi.log",
                    "maxLogSize": 200000,
                    "backups": 5,
                    "category": "wpi"
                },
                {
                    "type": "console",
                    "category":"console"
                }
            ]
        }
    }
});

var conf = {
    levels : nconf.get("logging:loglevels"),
    appenders : nconf.get("logging:logappenders"),
    simulation : nconf.get("simulation")
}

module.exports = conf;
