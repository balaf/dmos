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

module.exports = wpiObject;
