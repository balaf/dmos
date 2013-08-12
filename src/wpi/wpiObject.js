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

wpiObject.prototype.addNonce = function(nonce, final) {
    if (final) {
        this.message = {'nonce' : nonce, 'fragment': 'final'};
    } else {
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
    /// type: 3 = logoff

    var wpiMsg = new wpiObject();

    wpiMsg.addNonce(createNonce());
    wpiMsg.addRfc('inventory-changes');

    var items = {
        'device-type' : {'value' : device.deviceType},
        'related-device-type' : {'value' : device.deviceType},
        'gigabit-ethernet-enabled' : {'value' : 'false'},
        'software-type' : {'value' : device.softwareType},
        'related-software-type' : {'value' : device.softwareType},
        'software-version' : {'value' : device.firmware},
        'related-software-version' : {'value' : device.firmware},
        'contact-me-uri' : {'value' : 'http://192.168.40.5:8085/contact_dls.html/ContactDLS'},
        'mac-addr' : {'value' : device.mac},
        'configuration-changed-flag' : {'value' : 'false'},
        'part-number' : {'value' : 'S30817-S7403-C101-020'},
        'sip-mobility-state' : {'value' : device.mobilityState},     // 0 = logon, 1=logoff
        'e164' : {'value' : device.e164},
        'bootstrapping-tan' : {'value' : ''},
        'basic-e164' : {'value' : device.be164},
        'mobility-enabled' : {'value' : 'true'},
        'slog-archive-me' : {'value' : 'false'},
        'fault-report-slog-entry' : { 'value' : 'false'},
        'fault-time-slog-entry' : { 'value' : ''},
        'fault-report-ocsr-connect' : { 'value' : 'false'},
        'fault-tome-ocsr-connect' : { 'value' : ''},
        'fault-report-admin-pwd' : { 'value' : 'false'},
        'fault-time-admin-pwd' : { 'value' : ''},
        'fault-report-user-pwd' : { 'value' : 'false'},
        'fault-time-user-pwd' : { 'value' : 'false'},
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
    } else if (type === 3){
        wpiMsg.addItems({'configuration-changed-flag' : {'value' : 'true'}});
        wpiMsg.addItems({'user-pwd' : {'value' : device.pass}});
        wpiMsg.addItems({'modified-items' : {'value' : 'userdata-vu1,userdata-call-log,userdata-ring-tone,userdata-phonebook,userdata-call-group,userdata-voice-record,userdata-picture,userdata-ring-tone-mp3,userdata-screensaver,userdata-ldap'}});
    }

    return wpiMsg
}

function startUp(device){
    var wpiMsg = new wpiObject();

    wpiMsg.addNonce(createNonce());
    wpiMsg.addRfc('start-up');

    var items = {
        'device-type' : {'value' : device.deviceType},
        'related-device-type' : {'value' : device.deviceType},
        'gigabit-ethernet-enabled' : {'value' : 'false'},
        'software-type' : {'value' : device.softwareType},
        'related-software-type' : {'value' : device.softwareType},
        'software-version' : {'value' : device.firmware},
        'related-software-version' : {'value' : device.firmware},
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
        'slog-archive-me' : {'value' : 'false'},
        'fault-report-slog-entry' : { 'value' : 'false'},
        'fault-time-slog-entry' : { 'value' : ''},
        'fault-report-ocsr-connect' : { 'value' : 'false'},
        'fault-tome-ocsr-connect' : { 'value' : ''},
        'fault-report-admin-pwd' : { 'value' : 'false'},
        'fault-time-admin-pwd' : { 'value' : ''},
        'fault-report-user-pwd' : { 'value' : 'false'},
        'fault-time-user-pwd' : { 'value' : 'false'},
        'cloud-pin-value' : {'value' : 'failure'}
        //'' : {'value' : ''}
    }
    wpiMsg.addItems(items);

    return wpiMsg
}

function replyToWrite(device){
    var wpiMsg = new wpiObject();

    wpiMsg.addNonce(createNonce());
    wpiMsg.addRfc('reply-to', { 'status' : 'accepted', 'action' :'WriteItems'});

    return wpiMsg
}

function replyToReadUnmanaged(device){
    var wpiMsg = new wpiObject();

    wpiMsg.addNonce(createNonce());
    wpiMsg.addRfc('reply-to', { 'status' : 'accepted', 'action' :'ReadItems'});

    var items = {
        'userdata-vu1' : {'index' : '1', 'value' : 'AAEAAC90bXAvcHJpb3JpdHlfY2h1bmtpbmcudG1wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAVF3e8lXAAAAI1ZFUlNJT049MDIwMAojPE9DTVNUYWc+LDxJdGVtVmFsdWU+CmJ0LWF1dGgsZmFsc2UKb3Blbi1saXN0ZW5pbmctdm9sdW1lLDMKa2V5LW1vZHVsZS1kaXNwbGF5LWNvbnRyYXN0LDMKYnQtcGFpcmluZywxCnJpbmdlci12b2x1bWUsMQpidC1waW4sMDAwMApoZWFkc2V0LXZvbHVtZSw4CnVzZXItcHdkLWxhc3RjaGFuZ2VkLDEzNjY3ODQ3NDkKYnQtZGlzY292ZXJhYmxlLGZhbHNlCmxhbXAtYnJpZ2h0bmVzcywzCmhhbmRzZnJlZS12b2x1bWUsOApjYWxsLWRuZC1hY3RpdmF0ZWQsZmFsc2UKZm9yY2UtdXBkYXRlLGZhbHNlCnJpbmdlci1lbmFibGVkLHRydWUKYnQtbG9jYWwtbmFtZSxPcGVuU3RhZ2UgMDA6MUE6RTg6MkQ6M0Y6MDgKY2FsbC1mb3J3YXJkaW5nLWVuYWJsZWQsdHJ1ZQpidC1hY3RpdmUsZmFsc2UKYnQtZW5jcnlwdCxmYWxzZQp3YXJuLXRvbmUtdm9sdW1lLDEKYnQtbGFzdC1jb25uLWNsYXNzLDAKdG91Y2hndWlkZS1zZW5zaXRpdml0eSwxCmhhbmRzZXQtdm9sdW1lLDMKZGlzcGxheS1jb250cmFzdCwzCj=='},
        'userdata-call-log' : {'index' : '1', 'value' : 'AAEAAC90bXAvcHJpb3JpdHlfY2h1bmtpbmcudG1wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAVF3e8lXAAAAI1ZFUlNJT049MDIwMAojPE9DTVNUYWc+LDxJdGVtVmFsdWU+CmJ0LWF1dGgsZmFsc2UKb3Blbi1saXN0ZW5pbmctdm9sdW1lLDMKa2V5LW1vZHVsZS1kaXNwbGF5LWNvbnRyYXN0LDMKYnQtcGFpcmluZywxCnJpbmdlci12b2x1bWUsMQpidC1waW4sMDAwMApoZWFkc2V0LXZvbHVtZSw4CnVzZXItcHdkLWxhc3RjaGFuZ2VkLDEzNjY3ODQ3NDkKYnQtZGlzY292ZXJhYmxlLGZhbHNlCmxhbXAtYnJpZ2h0bmVzcywzCmhhbmRzZnJlZS12b2x1bWUsOApjYWxsLWRuZC1hY3RpdmF0ZWQsZmFsc2UKZm9yY2UtdXBkYXRlLGZhbHNlCnJpbmdlci1lbmFibGVkLHRydWUKYnQtbG9jYWwtbmFtZSxPcGVuU3RhZ2UgMDA6MUE6RTg6MkQ6M0Y6MDgKY2FsbC1mb3J3YXJkaW5nLWVuYWJsZWQsdHJ1ZQpidC1hY3RpdmUsZmFsc2UKYnQtZW5jcnlwdCxmYWxzZQp3YXJuLXRvbmUtdm9sdW1lLDEKYnQtbGFzdC1jb25uLWNsYXNzLDAKdG91Y2hndWlkZS1zZW5zaXRpdml0eSwxCmhhbmRzZXQtdm9sdW1lLDMKZGlzcGxheS1jb250cmFzdCwzCj=='},
        'userdata-ring-tone' : {'index' : '1', 'value' : 'AAEAAC90bXAvcHJpb3JpdHlfY2h1bmtpbmcudG1wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAVF3e8lXAAAAI1ZFUlNJT049MDIwMAojPE9DTVNUYWc+LDxJdGVtVmFsdWU+CmJ0LWF1dGgsZmFsc2UKb3Blbi1saXN0ZW5pbmctdm9sdW1lLDMKa2V5LW1vZHVsZS1kaXNwbGF5LWNvbnRyYXN0LDMKYnQtcGFpcmluZywxCnJpbmdlci12b2x1bWUsMQpidC1waW4sMDAwMApoZWFkc2V0LXZvbHVtZSw4CnVzZXItcHdkLWxhc3RjaGFuZ2VkLDEzNjY3ODQ3NDkKYnQtZGlzY292ZXJhYmxlLGZhbHNlCmxhbXAtYnJpZ2h0bmVzcywzCmhhbmRzZnJlZS12b2x1bWUsOApjYWxsLWRuZC1hY3RpdmF0ZWQsZmFsc2UKZm9yY2UtdXBkYXRlLGZhbHNlCnJpbmdlci1lbmFibGVkLHRydWUKYnQtbG9jYWwtbmFtZSxPcGVuU3RhZ2UgMDA6MUE6RTg6MkQ6M0Y6MDgKY2FsbC1mb3J3YXJkaW5nLWVuYWJsZWQsdHJ1ZQpidC1hY3RpdmUsZmFsc2UKYnQtZW5jcnlwdCxmYWxzZQp3YXJuLXRvbmUtdm9sdW1lLDEKYnQtbGFzdC1jb25uLWNsYXNzLDAKdG91Y2hndWlkZS1zZW5zaXRpdml0eSwxCmhhbmRzZXQtdm9sdW1lLDMKZGlzcGxheS1jb250cmFzdCwzCj=='},
        'userdata-phonebook' : {'index' : '1', 'value' : 'AAEAAC90bXAvcHJpb3JpdHlfY2h1bmtpbmcudG1wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAVF3e8lXAAAAI1ZFUlNJT049MDIwMAojPE9DTVNUYWc+LDxJdGVtVmFsdWU+CmJ0LWF1dGgsZmFsc2UKb3Blbi1saXN0ZW5pbmctdm9sdW1lLDMKa2V5LW1vZHVsZS1kaXNwbGF5LWNvbnRyYXN0LDMKYnQtcGFpcmluZywxCnJpbmdlci12b2x1bWUsMQpidC1waW4sMDAwMApoZWFkc2V0LXZvbHVtZSw4CnVzZXItcHdkLWxhc3RjaGFuZ2VkLDEzNjY3ODQ3NDkKYnQtZGlzY292ZXJhYmxlLGZhbHNlCmxhbXAtYnJpZ2h0bmVzcywzCmhhbmRzZnJlZS12b2x1bWUsOApjYWxsLWRuZC1hY3RpdmF0ZWQsZmFsc2UKZm9yY2UtdXBkYXRlLGZhbHNlCnJpbmdlci1lbmFibGVkLHRydWUKYnQtbG9jYWwtbmFtZSxPcGVuU3RhZ2UgMDA6MUE6RTg6MkQ6M0Y6MDgKY2FsbC1mb3J3YXJkaW5nLWVuYWJsZWQsdHJ1ZQpidC1hY3RpdmUsZmFsc2UKYnQtZW5jcnlwdCxmYWxzZQp3YXJuLXRvbmUtdm9sdW1lLDEKYnQtbGFzdC1jb25uLWNsYXNzLDAKdG91Y2hndWlkZS1zZW5zaXRpdml0eSwxCmhhbmRzZXQtdm9sdW1lLDMKZGlzcGxheS1jb250cmFzdCwzCj=='},
        'userdata-call-group' : {'index' : '1', 'value' : 'AAEAAC90bXAvcHJpb3JpdHlfY2h1bmtpbmcudG1wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAVF3e8lXAAAAI1ZFUlNJT049MDIwMAojPE9DTVNUYWc+LDxJdGVtVmFsdWU+CmJ0LWF1dGgsZmFsc2UKb3Blbi1saXN0ZW5pbmctdm9sdW1lLDMKa2V5LW1vZHVsZS1kaXNwbGF5LWNvbnRyYXN0LDMKYnQtcGFpcmluZywxCnJpbmdlci12b2x1bWUsMQpidC1waW4sMDAwMApoZWFkc2V0LXZvbHVtZSw4CnVzZXItcHdkLWxhc3RjaGFuZ2VkLDEzNjY3ODQ3NDkKYnQtZGlzY292ZXJhYmxlLGZhbHNlCmxhbXAtYnJpZ2h0bmVzcywzCmhhbmRzZnJlZS12b2x1bWUsOApjYWxsLWRuZC1hY3RpdmF0ZWQsZmFsc2UKZm9yY2UtdXBkYXRlLGZhbHNlCnJpbmdlci1lbmFibGVkLHRydWUKYnQtbG9jYWwtbmFtZSxPcGVuU3RhZ2UgMDA6MUE6RTg6MkQ6M0Y6MDgKY2FsbC1mb3J3YXJkaW5nLWVuYWJsZWQsdHJ1ZQpidC1hY3RpdmUsZmFsc2UKYnQtZW5jcnlwdCxmYWxzZQp3YXJuLXRvbmUtdm9sdW1lLDEKYnQtbGFzdC1jb25uLWNsYXNzLDAKdG91Y2hndWlkZS1zZW5zaXRpdml0eSwxCmhhbmRzZXQtdm9sdW1lLDMKZGlzcGxheS1jb250cmFzdCwzCj=='},
        'userdata-voice-record' : {'index' : '1', 'value' : 'AAEAAC90bXAvcHJpb3JpdHlfY2h1bmtpbmcudG1wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAVF3e8lXAAAAI1ZFUlNJT049MDIwMAojPE9DTVNUYWc+LDxJdGVtVmFsdWU+CmJ0LWF1dGgsZmFsc2UKb3Blbi1saXN0ZW5pbmctdm9sdW1lLDMKa2V5LW1vZHVsZS1kaXNwbGF5LWNvbnRyYXN0LDMKYnQtcGFpcmluZywxCnJpbmdlci12b2x1bWUsMQpidC1waW4sMDAwMApoZWFkc2V0LXZvbHVtZSw4CnVzZXItcHdkLWxhc3RjaGFuZ2VkLDEzNjY3ODQ3NDkKYnQtZGlzY292ZXJhYmxlLGZhbHNlCmxhbXAtYnJpZ2h0bmVzcywzCmhhbmRzZnJlZS12b2x1bWUsOApjYWxsLWRuZC1hY3RpdmF0ZWQsZmFsc2UKZm9yY2UtdXBkYXRlLGZhbHNlCnJpbmdlci1lbmFibGVkLHRydWUKYnQtbG9jYWwtbmFtZSxPcGVuU3RhZ2UgMDA6MUE6RTg6MkQ6M0Y6MDgKY2FsbC1mb3J3YXJkaW5nLWVuYWJsZWQsdHJ1ZQpidC1hY3RpdmUsZmFsc2UKYnQtZW5jcnlwdCxmYWxzZQp3YXJuLXRvbmUtdm9sdW1lLDEKYnQtbGFzdC1jb25uLWNsYXNzLDAKdG91Y2hndWlkZS1zZW5zaXRpdml0eSwxCmhhbmRzZXQtdm9sdW1lLDMKZGlzcGxheS1jb250cmFzdCwzCj=='},
        'userdata-picture' : {'index' : '1', 'value' : 'AAEAAC90bXAvcHJpb3JpdHlfY2h1bmtpbmcudG1wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAVF3e8lXAAAAI1ZFUlNJT049MDIwMAojPE9DTVNUYWc+LDxJdGVtVmFsdWU+CmJ0LWF1dGgsZmFsc2UKb3Blbi1saXN0ZW5pbmctdm9sdW1lLDMKa2V5LW1vZHVsZS1kaXNwbGF5LWNvbnRyYXN0LDMKYnQtcGFpcmluZywxCnJpbmdlci12b2x1bWUsMQpidC1waW4sMDAwMApoZWFkc2V0LXZvbHVtZSw4CnVzZXItcHdkLWxhc3RjaGFuZ2VkLDEzNjY3ODQ3NDkKYnQtZGlzY292ZXJhYmxlLGZhbHNlCmxhbXAtYnJpZ2h0bmVzcywzCmhhbmRzZnJlZS12b2x1bWUsOApjYWxsLWRuZC1hY3RpdmF0ZWQsZmFsc2UKZm9yY2UtdXBkYXRlLGZhbHNlCnJpbmdlci1lbmFibGVkLHRydWUKYnQtbG9jYWwtbmFtZSxPcGVuU3RhZ2UgMDA6MUE6RTg6MkQ6M0Y6MDgKY2FsbC1mb3J3YXJkaW5nLWVuYWJsZWQsdHJ1ZQpidC1hY3RpdmUsZmFsc2UKYnQtZW5jcnlwdCxmYWxzZQp3YXJuLXRvbmUtdm9sdW1lLDEKYnQtbGFzdC1jb25uLWNsYXNzLDAKdG91Y2hndWlkZS1zZW5zaXRpdml0eSwxCmhhbmRzZXQtdm9sdW1lLDMKZGlzcGxheS1jb250cmFzdCwzCj=='},
        'userdata-ring-tone-mp3' : {'index' : '1', 'value' : 'AAEAAC90bXAvcHJpb3JpdHlfY2h1bmtpbmcudG1wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAVF3e8lXAAAAI1ZFUlNJT049MDIwMAojPE9DTVNUYWc+LDxJdGVtVmFsdWU+CmJ0LWF1dGgsZmFsc2UKb3Blbi1saXN0ZW5pbmctdm9sdW1lLDMKa2V5LW1vZHVsZS1kaXNwbGF5LWNvbnRyYXN0LDMKYnQtcGFpcmluZywxCnJpbmdlci12b2x1bWUsMQpidC1waW4sMDAwMApoZWFkc2V0LXZvbHVtZSw4CnVzZXItcHdkLWxhc3RjaGFuZ2VkLDEzNjY3ODQ3NDkKYnQtZGlzY292ZXJhYmxlLGZhbHNlCmxhbXAtYnJpZ2h0bmVzcywzCmhhbmRzZnJlZS12b2x1bWUsOApjYWxsLWRuZC1hY3RpdmF0ZWQsZmFsc2UKZm9yY2UtdXBkYXRlLGZhbHNlCnJpbmdlci1lbmFibGVkLHRydWUKYnQtbG9jYWwtbmFtZSxPcGVuU3RhZ2UgMDA6MUE6RTg6MkQ6M0Y6MDgKY2FsbC1mb3J3YXJkaW5nLWVuYWJsZWQsdHJ1ZQpidC1hY3RpdmUsZmFsc2UKYnQtZW5jcnlwdCxmYWxzZQp3YXJuLXRvbmUtdm9sdW1lLDEKYnQtbGFzdC1jb25uLWNsYXNzLDAKdG91Y2hndWlkZS1zZW5zaXRpdml0eSwxCmhhbmRzZXQtdm9sdW1lLDMKZGlzcGxheS1jb250cmFzdCwzCj=='},
        'userdata-screensaver' : {'index' : '1', 'value' : 'AAEAAC90bXAvcHJpb3JpdHlfY2h1bmtpbmcudG1wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAVF3e8lXAAAAI1ZFUlNJT049MDIwMAojPE9DTVNUYWc+LDxJdGVtVmFsdWU+CmJ0LWF1dGgsZmFsc2UKb3Blbi1saXN0ZW5pbmctdm9sdW1lLDMKa2V5LW1vZHVsZS1kaXNwbGF5LWNvbnRyYXN0LDMKYnQtcGFpcmluZywxCnJpbmdlci12b2x1bWUsMQpidC1waW4sMDAwMApoZWFkc2V0LXZvbHVtZSw4CnVzZXItcHdkLWxhc3RjaGFuZ2VkLDEzNjY3ODQ3NDkKYnQtZGlzY292ZXJhYmxlLGZhbHNlCmxhbXAtYnJpZ2h0bmVzcywzCmhhbmRzZnJlZS12b2x1bWUsOApjYWxsLWRuZC1hY3RpdmF0ZWQsZmFsc2UKZm9yY2UtdXBkYXRlLGZhbHNlCnJpbmdlci1lbmFibGVkLHRydWUKYnQtbG9jYWwtbmFtZSxPcGVuU3RhZ2UgMDA6MUE6RTg6MkQ6M0Y6MDgKY2FsbC1mb3J3YXJkaW5nLWVuYWJsZWQsdHJ1ZQpidC1hY3RpdmUsZmFsc2UKYnQtZW5jcnlwdCxmYWxzZQp3YXJuLXRvbmUtdm9sdW1lLDEKYnQtbGFzdC1jb25uLWNsYXNzLDAKdG91Y2hndWlkZS1zZW5zaXRpdml0eSwxCmhhbmRzZXQtdm9sdW1lLDMKZGlzcGxheS1jb250cmFzdCwzCj=='},
        'userdata-ldap' : {'index' : '1', 'value' : 'AAEAAC90bXAvcHJpb3JpdHlfY2h1bmtpbmcudG1wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAVF3e8lXAAAAI1ZFUlNJT049MDIwMAojPE9DTVNUYWc+LDxJdGVtVmFsdWU+CmJ0LWF1dGgsZmFsc2UKb3Blbi1saXN0ZW5pbmctdm9sdW1lLDMKa2V5LW1vZHVsZS1kaXNwbGF5LWNvbnRyYXN0LDMKYnQtcGFpcmluZywxCnJpbmdlci12b2x1bWUsMQpidC1waW4sMDAwMApoZWFkc2V0LXZvbHVtZSw4CnVzZXItcHdkLWxhc3RjaGFuZ2VkLDEzNjY3ODQ3NDkKYnQtZGlzY292ZXJhYmxlLGZhbHNlCmxhbXAtYnJpZ2h0bmVzcywzCmhhbmRzZnJlZS12b2x1bWUsOApjYWxsLWRuZC1hY3RpdmF0ZWQsZmFsc2UKZm9yY2UtdXBkYXRlLGZhbHNlCnJpbmdlci1lbmFibGVkLHRydWUKYnQtbG9jYWwtbmFtZSxPcGVuU3RhZ2UgMDA6MUE6RTg6MkQ6M0Y6MDgKY2FsbC1mb3J3YXJkaW5nLWVuYWJsZWQsdHJ1ZQpidC1hY3RpdmUsZmFsc2UKYnQtZW5jcnlwdCxmYWxzZQp3YXJuLXRvbmUtdm9sdW1lLDEKYnQtbGFzdC1jb25uLWNsYXNzLDAKdG91Y2hndWlkZS1zZW5zaXRpdml0eSwxCmhhbmRzZXQtdm9sdW1lLDMKZGlzcGxheS1jb250cmFzdCwzCj=='}
    };
    wpiMsg.addItems(items);

    return wpiMsg
}

function replyToReadAll(device){
    var wpiMsg = new wpiObject();

    wpiMsg.addNonce(createNonce());
    wpiMsg.addRfc('reply-to', { 'status' : 'accepted', 'action' :'ReadAllItems'});

    var items = {
        'device-type' : {'value' : device.deviceType},
        'related-device-type' : {'value' : device.deviceType},
        'gigabit-ethernet-enabled' : {'value' : 'false'},
        'software-type' : {'value' : device.softwareType},
        'related-software-type' : {'value' : device.softwareType},
        'software-version' : {'value' : device.firmware},
        'related-software-version' : {'value' : device.firmware},
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
        'slog-archive-me' : {'value' : 'false'},
        'fault-report-slog-entry' : { 'value' : 'false'},
        'fault-time-slog-entry' : { 'value' : ''},
        'fault-report-ocsr-connect' : { 'value' : 'false'},
        'fault-tome-ocsr-connect' : { 'value' : ''},
        'fault-report-admin-pwd' : { 'value' : 'false'},
        'fault-time-admin-pwd' : { 'value' : ''},
        'fault-report-user-pwd' : { 'value' : 'false'},
        'fault-time-user-pwd' : { 'value' : 'false'},
        'cloud-pin-value' : {'value' : 'failure'},
        'wap-xcon-type':{'value':'0'},
        'ldap-server-address':{'value':'0.0.0.0'},
        'ldap-server-port':{'value':'389'},
        'ldap-transport':{'value':'1'},
        'ldap-authentication':{'value':'0'},
        'user-midlet-download-allowed':{'value':'true'},
        'enable-untrusted-midlets':{'value':'false'},
        'ldap-search-trigger-timeout':{'value':'3'},
        'Canonical-dialing-dial-internal-form':{'value':'0'},
        'Canonical-dialing-dial-external-form':{'value':'0'},
        'Canonical-dialing-dial-needs-access-code':{'value':'0'},
        'Canonical-dialing-dial-needs-intGWcode':{'value':'0'},
        'hot-line-warm-line':{'value':'1'},
        'auto-answer':{'value':'false'},
        'beep-on-auto-answer':{'value':'false'},
        'auto-reconnect':{'value':'false'},
        'beep-on-auto-reconnect':{'value':'false'},
        'refuse-call':{'value':'false'},
        'feature-availability':[{'value':'true', 'index':'0'},
                                {'value':'true', 'index':'1'},
                                {'value':'true', 'index':'2'},
                                {'value':'true', 'index':'3'},
                                {'value':'true', 'index':'4'},
                                {'value':'true', 'index':'5'},
                                {'value':'true', 'index':'6'},
                                {'value':'true', 'index':'7'},
                                {'value':'true', 'index':'8'},
                                {'value':'true', 'index':'9'},
                                {'value':'true', 'index':'10'},
                                {'value':'true', 'index':'11'},
                                {'value':'true', 'index':'12'},
                                {'value':'true', 'index':'13'},
                                {'value':'true', 'index':'14'},
                                {'value':'true', 'index':'15'},
                                {'value':'true', 'index':'16'},
                                {'value':'true', 'index':'17'},
                                {'value':'true', 'index':'18'},
                                {'value':'true', 'index':'19'},
                                {'value':'true', 'index':'20'},
                                {'value':'true', 'index':'21'},
                                {'value':'true', 'index':'22'},
                                {'value':'true', 'index':'23'},
                                {'value':'false', 'index':'24'},
                                {'value':'true', 'index':'25'},
                                {'value':'true', 'index':'26'},
                                {'value':'true', 'index':'27'},
                                {'value':'true', 'index':'28'},
                                {'value':'true', 'index':'29'},
                                {'value':'true', 'index':'30'},
                                {'value':'true', 'index':'31'},
                                {'value':'true', 'index':'32'},
                                {'value':'true', 'index':'33'},
                                {'value':'true', 'index':'34'},
                                {'value':'true', 'index':'35'},
                                {'value':'true', 'index':'36'}],
        'callback-cancel-allow':{'value':'false'},
        'callback-ring-allow':{'value':'false'},
        'hot-keypad-dialing':{'value':'false'},
        'initial-digit-timer':{'value':'20'},
        'join-allowed-in-conference':{'value':'false'},
        'unconditional-transfer':{'value':'false'},
        'uaCSTA-enabled':{'value':'false'},
        'loudspeaker-function-mode':{'value':'0'},
        'call-record-audible-indication':{'value':'false'},
        'call-record-auto-start':{'value':'false'},
        'secure-call-alert':{'value':'false'},
        'idle-missed-calls':{'value':'false'},
        'server-based-features':{'value':'false'},
        'cfu-activated':{'value':'false'},
        'cfb-activated':{'value':'false'},
        'cfnr-activated':{'value':'false'},
        'forwarding-notification-audible':{'value':'true'},
        'forwarding-notification-visual':{'value':'true'},
        'cfnr-delay':{'value':'16'},
        'call-deflection-enabled':{'value':'false'},
        'call-waiting-enabled':{'value':'false'},
        'call-transfer-enabled':{'value':'false'},
        'transfer-on-ring-enabled':{'value':'false'},
        'call-join-enabled':{'value':'false'},
        'call-dnd-enabled':{'value':'false'},
        'call-holdringback-enabled':{'value':'false'},
        'hold-and-hang-up':{'value':'false'},
        'busy-when-dialling-enabled':{'value':'false'},
        'callback-ring-enabled':{'value':'false'},
        'user-conference-enabled':{'value':'false'},
        'autodialtimer':{'value':'6'},
        'holdringback-timer':{'value':'3'},
        'implicit-call-association':{'value':'false'},
        'forwarding-party-display':{'value':'0'},
        'bridging-enabled':{'value':'false'},
        'pb-lookups-allowed':{'value':'true'},
        'call-record-all-calls':{'value':'false'},
        'call-record-audible-indication-continuous':{'value':'false'},
        'fpk-long-press-timer':{'value':'2'},
        'call-log-enabled':{'value':'true'},
        'missed-logging':{'value':'0'},
        'video-allowed':{'value':'false'},
        'video-on':{'value':'false'},
        'callback-busy-enabled':{'value':'false'},
        'callback-busy-allow':{'value':'false'},
        'dial-plan-enabled':{'value':'false'},
        'sip-payload-security-alert':{'value':'false'},
        'alert':[{'value':'^^^^', 'index':'1'},
                {'value':'^^^^', 'index':'2'},
                {'value':'^^^^', 'index':'3'},
                {'value':'^^^^', 'index':'4'},
                {'value':'^^^^', 'index':'5'},
                {'value':'^^^^', 'index':'6'},
                {'value':'^^^^', 'index':'7'},
                {'value':'^^^^', 'index':'8'},
                {'value':'^^^^', 'index':'9'},
                {'value':'^^^^', 'index':'10'},
                {'value':'^^^^', 'index':'11'},
                {'value':'^^^^', 'index':'12'},
                {'value':'^^^^', 'index':'13'},
                {'value':'^^^^', 'index':'14'},
                {'value':'^^^^', 'index':'15'}],
        'line-registration-leds':{'value':'false'},
        'line-rollover-type':{'value':'0'},
        'line-rollover-volume':{'value':'2'},
        'originating-line-preference':{'value':'0'},
        'terminating-line-preference':{'value':'0'},
        'line-key-operating-mode':{'value':'0'},
        'keyset-remote-forward-ind':{'value':'false'},
        'keyset-reservation-timer':{'value':'60'},
        'keyset-use-focus':{'value':'false'},
        'line-button-mode':{'value':'0'},
        'line-preselection-timer':{'value':'10'},
        'dss-sip-deflect':{'value':'false'},
        'dss-sip-refuse':{'value':'false'},
        'preview-timer':{'value':'8'},
        'preview-mode-locked':{'value':'false'},
        'dss-forwarding-indication':{'value':'false'},
        'bridging-overrides-preview':{'value':'0'},
        'language-iso':{'value':'en'},
        'country-iso':{'value':'US'},
        'mwi-e164':{'value':'0.0.0.0'},
        'beep-on-error':{'value':'true'},
        'display-skin':{'value':'0'},
        'screensaver-image-timeout':{'value':'10'},
        'screensaver-enabled':{'value':'false'},
        'inactivity-timeout':{'value':'5'},
        'MWI-new-show':{'value':'false'},
        'MWI-new-urgent-show':{'value':'true'},
        'MWI-old-show':{'value':'true'},
        'MWI-old-urgent-show':{'value':'true'},
        'phone-lock-active':{'value':'false'},
        'context-menu-auto-show':{'value':'true'},
        'context-menu-auto-hide-time':{'value':'20'},
        'pixelsaver-timeout-xt':{'value':'5'},
        'country':{'value':'0'},
        'language':{'value':'0'},
        'reg-addr':{'value':'172.25.5.131'},
        'reg-port':{'value':'5060'},
        'registrar-addr':{'value':'172.25.1.131'},
        'registrar-port':{'value':'5060'},
        'register-by-name':{'value':'false'},
        'session-timer':{'value':'false'},
        'session-duration':{'value':'3600'},
        'reg-ttl':{'value':'3600'},
        'realm':{'value':'sen'},
        'sgnl-route':{'value':'0'},
        'phone-port':{'value':'5060'},
        'rtp-base-port':{'value':'5004'},
        'sip-user-id':{'value':'302108189636'},
        'sip-pwd':{'value':'123456'},
        'server-type':{'value':'1'},
        'display-id-unicode':{'value':'656 - logged on'},
        'use-display-id':{'value':'true'},
        'outbound-proxy-user':{'value':'true'},
        'sgnl-gateway-addr-user':{'value':'0.0.0.0'},
        'sgnl-gateway-port-user':{'value':'0'},
        'sip-keepalive-method':{'value':'0'},
        'MLPP-base':{'value':'0'},
        'MLPP-domain-type':{'value':'2'},
        'user-pwd':{'value':'123456'},
        'min-user-passw-length':{'value':'6'},
        'enable-resource-sharing':{'value':'false'},
        'enable-WBM':{'value':'true'},
        'enable-PC-apps-interface':{'value':'true'},
        'enable-phone-manager':{'value':'true'},
        'directory-guard-required':{'value':'false'},
        'directory-guard-timeout':{'value':'10'},
        'force-update':{'value':'true'},
        'date-format':{'value':'0'},
        'time-format':{'value':'0'},
        'voice-message-dial-tone':{'value':'false'},
        'group-pickup-as-ringer':{'value':'false'},
        'group-pickup-tone-allowed':{'value':'true'},
        'group-pickup-alert-type':{'value':'0'},
        'ringer-melody':{'value':'2'},
        'ringer-tone-sequence':{'value':'2'},
        'moh-enabled':{'value':'true'},
        'IL-alert-notification-enabled':{'value':'true'},
        'blf-tone-type':{'value':'0'},
        'key-click-volume':{'value':'0'},
        'click-keys':{'value':'0'},
        'default-locked-function-keys':{'value':'false'},
        'default-locked-config-menus':{'value':'false'},
        'default-locked-local-function-menus':{'value':'false'},
        'mobility-password-on-logoff':{'value':'false'},
        'unauthorised-trap':{'value':'false'},
        'unauthorised-trap-delay':{'value':'300'},
        'count-medium-priority':{'value':'5'},
        'timer-medium-priority':{'value':'60'},
        'timer-high-priority':{'value':'5'},
        'international-mobility-id':{'value':'false'},
        'locked-local-function-menus':[{'value':'false', 'index':'1'},
                                    {'value':'false', 'index':'2'},
                                    {'value':'false', 'index':'3'},
                                    {'value':'false', 'index':'4'},
                                    {'value':'false', 'index':'5'},
                                    {'value':'false', 'index':'6'},
                                    {'value':'false', 'index':'7'},
                                    {'value':'false', 'index':'8'},
                                    {'value':'false', 'index':'9'},
                                    {'value':'false', 'index':'10'}],
        'locked-config-menus':[{'value':'false', 'index':'1'},
                            {'value':'false', 'index':'2'},
                            {'value':'false', 'index':'3'},
                            {'value':'false', 'index':'4'},
                            {'value':'false', 'index':'5'},
                            {'value':'false', 'index':'6'},
                            {'value':'false', 'index':'7'},
                            {'value':'false', 'index':'8'},
                            {'value':'false', 'index':'9'},
                            {'value':'false', 'index':'10'},
                            {'value':'false', 'index':'11'},
                            {'value':'false', 'index':'12'},
                            {'value':'false', 'index':'13'},
                            {'value':'false', 'index':'14'},
                            {'value':'false', 'index':'15'},
                            {'value':'false', 'index':'16'},
                            {'value':'false', 'index':'17'},
                            {'value':'false', 'index':'18'},
                            {'value':'false', 'index':'19'},
                            {'value':'false', 'index':'20'},
                            {'value':'false', 'index':'21'},
                            {'value':'false', 'index':'22'},
                            {'value':'false', 'index':'23'},
                            {'value':'false', 'index':'24'},
                            {'value':'false', 'index':'25'},
                            {'value':'false', 'index':'26'},
                            {'value':'false', 'index':'27'},
                            {'value':'false', 'index':'28'},
                            {'value':'false', 'index':'29'},
                            {'value':'false', 'index':'30'},
                            {'value':'false', 'index':'31'},
                            {'value':'false', 'index':'32'},
                            {'value':'false', 'index':'33'},
                            {'value':'false', 'index':'34'},
                            {'value':'false', 'index':'35'},
                            {'value':'false', 'index':'36'},
                            {'value':'false', 'index':'37'},
                            {'value':'false', 'index':'38'},
                            {'value':'false', 'index':'39'},
                            {'value':'false', 'index':'40'},
                            {'value':'false', 'index':'41'},
                            {'value':'false', 'index':'42'},
                            {'value':'false', 'index':'43'},
                            {'value':'false', 'index':'44'},
                            {'value':'false', 'index':'45'},
                            {'value':'false', 'index':'46'},
                            {'value':'false', 'index':'47'},
                            {'value':'false', 'index':'48'},
                            {'value':'false', 'index':'49'},
                            {'value':'false', 'index':'50'},
                            {'value':'false', 'index':'51'},
                            {'value':'false', 'index':'52'},
                            {'value':'false', 'index':'53'},
                            {'value':'false', 'index':'54'},
                            {'value':'false', 'index':'55'},
                            {'value':'false', 'index':'56'},
                            {'value':'false', 'index':'57'},
                            {'value':'false', 'index':'58'},
                            {'value':'false', 'index':'59'},
                            {'value':'false', 'index':'60'},
                            {'value':'false', 'index':'61'},
                            {'value':'false', 'index':'62'},
                            {'value':'false', 'index':'63'},
                            {'value':'false', 'index':'64'},
                            {'value':'false', 'index':'65'},
                            {'value':'false', 'index':'66'},
                            {'value':'false', 'index':'67'},
                            {'value':'false', 'index':'68'},
                            {'value':'false', 'index':'69'},
                            {'value':'false', 'index':'70'},
                            {'value':'false', 'index':'71'},
                            {'value':'false', 'index':'72'},
                            {'value':'false', 'index':'73'},
                            {'value':'false', 'index':'74'},
                            {'value':'false', 'index':'75'},
                            {'value':'false', 'index':'76'},
                            {'value':'false', 'index':'77'},
                            {'value':'false', 'index':'78'},
                            {'value':'false', 'index':'79'}],
        'voip-payload-security-allowed':{'value':'false'},
        'voip-connectivity-check-interval':{'value':'120'},
        'voip-server-validation':{'value':'false'},
        'srtp-key-negotiation-method':{'value':'0'},
        'secure-call-payload-options':{'value':'0'},
        'default-profile':{'value':'false'}
    }
    wpiMsg.addItems(items);

    return wpiMsg
}


//module.exports = wpiObject;
module.exports.invChages = invChanges;
module.exports.startUp = startUp;
module.exports.replyToWrite = replyToWrite;
module.exports.replyToReadUnmanaged = replyToReadUnmanaged;
module.exports.replyToReadAll = replyToReadAll;

