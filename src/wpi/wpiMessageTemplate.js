'use strict';

var hbs = require('handlebars');


var src = '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '    <WorkpointMessage xmlns="http://www.siemens.com/DLS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.siemens.com/DLS">\n' +
          '      <Message nonce="{{message.nonce}}" maxItems="-1">\n' +
          '      {{#rfc rfc}}<ReasonForContact{{#each attr}} {{atName}}="{{atValue}}"{{/each}}>{{value}}</ReasonForContact>{{/rfc}}\n' +
          '      {{#itemList itemList}}\n' +
          '         <Item name="{{name}}"{{#each attr}} {{atName}}="{{atValue}}"{{/each}}>{{value}}</Item>{{/itemList}}\n' +
          '      </Message>\n' +
          '   </WorkpointMessage>\n';

hbs.registerHelper("rfc", function(obj, options) {
    var buffer=" ";
    var attribute;
    var tempObj = {};

    tempObj.attr = [];
    tempObj.value = obj.value;
    for (attribute in obj) {
        if (attribute !== 'value') {
            tempObj.attr.push({atName: attribute, atValue: obj[attribute]});
        }
    }
    buffer += options.fn(tempObj);
    return buffer;
});

/// Create Block Helper for Handlebars to render the list of items
hbs.registerHelper("itemList", function(obj, options) {
    var buffer="";
    var done = 0;
    var key;
    var attribute, i;
    buffer = ' <ItemList>';
    for (key in obj) {
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
        buffer += '\n       </ItemList>';
    }
    return buffer;
});


var template = hbs.compile(src);

module.exports =  template;
