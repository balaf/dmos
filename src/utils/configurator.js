nconf = require('nconf');

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
    logging: {
        "loglevels": {
            "default":"ALL",
            "console":"ALL",
            "wpi":"ALL"
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
                    "absolute": true,
                    "filename": "../log/fsm.log",
                    "maxLogSize": 200000,
                    "backups": 5,
                    "category": "fsm"
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
    appenders : nconf.get("logging:logappenders")
}

module.exports = conf;
