'use strict';

var hbs = require('handlebars');
var wpiObject =   require( __dirname + '/wpiObject');


var src = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<WorkpointMessage xmlns="http://www.siemens.com/DLS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.siemens.com/DLS">' +
    '<Message nonce="{{message.nonce}}">' +
    '{{#rfc rfc}}<ReasonForContact {{#each attr}} {{atName}}="{{atValue}}"{{/each}}>{{value}}</ReasonForContact>{{/rfc}}' +
             '{{#itemList itemList}}' +
        '<Item name="{{name}}"{{#each attr}} {{atName}}="{{atValue}}"{{/each}}>{{value}}</Item>{{/itemList}}' +
        '</Message>' +
        '</WorkpointMessage>';




hbs.registerHelper("rfc", function(obj, options) {
    var buffer="";
    var done = 0;
    var key;
    var attribute, i;
    for (key in obj) {
        if (done === 0) {
            done = 1;
            buffer = '';
        }
        if (obj.hasOwnProperty(key)) {
            var tempObj = {};
            tempObj.name = key;
            tempObj.attr = [];
            tempObj.value = obj[key].value;
            for (attribute in obj[key]) {
                if (attribute !== 'value') {
                    tempObj.attr.push({atName: attribute, atValue: obj[key][attribute]});
                }
            }
            buffer += options.fn(tempObj);
        }
    }
    if (buffer !== ""){
        buffer += '\n';
    }
    console.log("Buffer", buffer);
    return buffer;
});



/// Create Block Helper for Handlebars to render the list of items
hbs.registerHelper("itemList", function(obj, options) {
    var buffer="";
    var done = 0;
    var key;
    var attribute, i;
    for (key in obj) {
        if (done === 0) {
            done = 1;
            buffer = '<ItemList>';
        }
        if (obj.hasOwnProperty(key)) {
            var tempObj = {};
            if (!obj[key].length) {
                tempObj.name = key;
                tempObj.attr = [];
                tempObj.value = obj[key].value;
                for (attribute in obj[key]) {
                    if (attribute !== 'value') {
                        tempObj.attr.push({atName: attribute, atValue: obj[key][attribute]});
                    }
                }
                buffer += options.fn(tempObj);
            } else {// indexed item
                for (i = 0; i<obj[key].length; i++) {
                    tempObj.name = key;
                    tempObj.attr = [];
                    tempObj.value = obj[key][i].value;
                    for (attribute in obj[key][i]) {
                        if (attribute !== 'value') {
                            tempObj.attr.push({atName: attribute, atValue: obj[key][i][attribute]});
                        }
                    }
                    buffer += options.fn(tempObj);
                }
            }
        }
    }
    if (buffer !== ""){
        buffer += '\n             </ItemList>';
    }
    return buffer;
});


var template = hbs.compile(src);

var dlsMsg = new wpiObject();
dlsMsg.addNonce('aaaaaaaaaaaaaa');
dlsMsg.addRfc('reply-to', {'status': 'Accepted', 'action':'ReadItems'});
var items = { 'userdat-aring' : { value : 'zzzzzzzzzzzz'},

};
dlsMsg.addItems(items);
console.log(dlsMsg);

var result = template(dlsMsg);
console.log(result)