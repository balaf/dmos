'use strict';

var wpiObject = function (wpiMsg) {
    if (wpiMsg) {
        this.id = wpiMsg.id || {};
        this.isWPI = true;
        this.rfc = wpiMsg.rfc || {};
        this.message = wpiMsg.message || {};
        this.itemList = wpiMsg.itemList || {};
    } else {
        this.id = null;
        this.isWPI = true;
        this.rfc = {};
        this.message = {};
        this.itemList = {};
    }
};

wpiObject.prototype.getItemValue = function  (name) {
    var result;

    if (this.itemList[name]) {
        result = this.itemList[name].value;
    }
    return result;
};

// Example: device.addItems({'e164':{ 'value': '302108189656'}, 'mac': {'value': '02:00:00:00:00:00'}});
// if the item exists, it is overwritten with the new value
wpiObject.prototype.addItems = function(items) {
    var property;
    for (property in items) {
        this.itemList[property] = items[property];
    }
};

wpiObject.prototype.addNonce = function(nonce) {
    if (nonce) {
        this.message = {'nonce' : nonce};
    }
};

// Example: device.addRfc('ReadAllItems', {'status': 'Accepted'});
wpiObject.prototype.addRfc = function (reason, attributes) {
    if (reason) {
        this.rfc.value = reason;
        var property;
        for (property in attributes) {
            this.rfc[property] = attributes[property];
        }
    }
};

function createNonce(){
    var nonce = "";
    for (var i=0; i<32; i++)
        nonce += Math.floor(Math.random()*15).toString(16).toUpperCase();
    return nonce;
}

function invChanges(device,type){
    /// type: 1 = the first inv-changes of a SIP logon flow
    /// type: 2 = the second inv-changes of a SIP logon flow

    var wpiMsg = new wpiObject();

    wpiMsg.addNonce(createNonce());
    wpiMsg.addRfc('inventory-changes');

    var items = {
        'device-type' : {'value' : 'OpenStage 60'},
        'related-device-type' : {'value' : 'OpenStage 60'},
        'gigabit-ethernet-enabled' : {'value' : 'false'},
        'software-type' : {'value' : 'Siemens SIP'},
        'related-software-type' : {'value' : 'Siemens SIP'},
        'software-version' : {'value' : 'V3 R1.41.1'},
        'related-software-version' : {'value' : 'V3 R1.41.1'},
        'contact-me-uri' : {'value' : 'http://192.168.40.5:8085/contact_dls.html/ContactDLS'},
        'mac-addr' : {'value' : device.mac},
        'configuration-changed-flag' : {'value' : 'false'},
        'part-number' : {'value' : 'S30817-S7403-C101-020'},
        'sip-mobility-state' : {'value' : device.mobilityState},     // 0 = logon, 1=logoff
        'e164' : {'value' : device.e164},
        'bootstrapping-tan' : {'value' : ''},
        'basic-e164' : {'value' : device.be164},
        'mobility-enabled' : {'value' : 'true'},
        'cloud-pin-value' : {'value' : 'failure'},
        'key-modules' : {'value' : ''},
        'blf-modules' : {'value' : '', 'status' : 'failed'},
        'slk-modules' : {'value' : '0'},
        'km15-modules' : {'value' : '0'}
        //'' : {'value' : ''}
    }
    wpiMsg.addItems(items)
    if (type === 1)  {// the first inv-changes includes the user password
        wpiMsg.addItems({'user-pwd' : {'value' : device.pass}});
    } else if (type === 2) {
        wpiMsg.addItems({'requested-items' : {'value' : 'userdata-vu1,userdata-call-log,userdata-ring-tone,userdata-phonebook,userdata-call-group,userdata-voice-record,userdata-picture,userdata-ring-tone-mp3,userdata-screensaver,userdata-ldap'}});
    }

    return wpiMsg
}

function startUp(device){
    var wpiMsg = new wpiObject();

    wpiMsg.addNonce(createNonce());
    wpiMsg.addRfc('start-up');

    var items = {
        'device-type' : {'value' : 'OpenStage 60'},
        'related-device-type' : {'value' : 'OpenStage 60'},
        'gigabit-ethernet-enabled' : {'value' : 'false'},
        'software-type' : {'value' : 'Siemens SIP'},
        'related-software-type' : {'value' : 'Siemens SIP'},
        'software-version' : {'value' : 'V3 R1.41.1'},
        'related-software-version' : {'value' : 'V3 R1.41.1'},
        'contact-me-uri' : {'value' : 'http://192.168.40.5:8085/contact_dls.html/ContactDLS'},
        'mac-addr' : {'value' : device.mac},
        'configuration-changed-flag' : {'value' : 'false'},
        'part-number' : {'value' : 'S30817-S7403-C101-020'},
        'backlight-type' : {'value' : '1'},
        'sip-mobility-state' : {'value' : device.mobilityState},     // 0 = logon, 1=logoff 2=interim
        'e164' : {'value' : device.e164},
        'bootstrapping-tan' : {'value' : ''},
        'basic-e164' : {'value' : device.be164},
        'mobility-enabled' : {'value' : 'true'},
        'cloud-pin-value' : {'value' : 'failure'}
        //'' : {'value' : ''}
    }
    wpiMsg.addItems(items)

    return wpiMsg
}

function replyToWrite(device){
    var wpiMsg = new wpiObject();

    wpiMsg.addNonce(createNonce());
    wpiMsg.addRfc('reply-to', { 'status' : 'Accepted', 'action' :'WriteItems'});

    return wpiMsg
}

//module.exports = wpiObject;
module.exports.invChages = invChanges;
module.exports.startUp = startUp;
module.exports.replyToWrite = replyToWrite;


