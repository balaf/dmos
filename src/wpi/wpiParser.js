'use strict';

var sax = require('sax');

/* Case sensitive list of strings used by the devices as initial RFCs
 An intial RFC determine the initiation of a new WPI flow - mac-addr is manadatory in an initial RFC
 DLS will generate a new session ID (and reset the status to 'idle') when a WPI message
 with an initial RFC arrives
 */

/*
var src = '<?xml version="1.0" encoding="UTF-8"?>' +
          '     <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">' +
          '        <SignedInfo>' +
          '             <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"></CanonicalizationMethod>' +
          '             <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"></SignatureMethod>' +
          '             <Reference URI="#DLSMessage">' +
          '                <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></DigestMethod>' +
          '               <DigestValue>b/6IwPFpEQPk4n/6LyTmvEyQXEY=</DigestValue>' +
          '             </Reference>' +
          '         </SignedInfo>' +
          '         <SignatureValue>' +
          '            Z4anTM4qRTZEG4OT6rKCMJkt7eUKqZijGj22fc8RZIa6O6tFqXxauLbYZ2vnGncEO/6ipMIi16u4jI4TlDJSZvVTvyArcxJHYGIoeKJTOamx+SP5svXP9GGROmQi2MmPmyP4KSqghFR5+KoXS+cjRa1sJBhS3CtnRgy9cgVS26U=' +
          '         </SignatureValue>' +
          '     <Object Id="DLSMessage">' +
          '     <DLSMessage xmlns="http://www.siemens.com/DLS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.siemens.com/DLS">' +
          '       <Message nonce="7216FCB4D2F6DCB7B8A7A2B73C909418">' +
          '            <Action>CleanUp</Action>' +
          '                 <ItemList>' +
          '                     <Item name="cleanup-reason">overload</Item>' +
          '                 </ItemList>' +
          '       </Message>' +
          '     </DLSMessage></Object>' +
          '     </Signature>';
*/

// console.log("message:", src);

var wpiParser = function(xml, callback) {
    var parser = sax.parser(true);

    var currentObject = {};
    var message = {};
    var rfc = {};
    var itemList = {};
    var WPI_tag = 0;
    var Message_tag = 0;
    var Rfc_tag = 0;
    var Itemlist_tag = 0;
    var Item_tag = 0;


    /// Increment by 2 when a tag opens
    /// Decrement by 1 when a tag closes
    /// At the end we get the count of each tag

    parser.onopentag = function (tag) {
        var property;
        if (tag.name === 'DLSMessage') {
            WPI_tag += 2;
        } else if (tag.name === 'Message') {
            Message_tag += 2;
            for (property in tag.attributes){
                message[property] = tag.attributes[property];
            }
        } else if (tag.name === 'Action') {
            Rfc_tag += 2;
            currentObject = rfc;
            for (property in tag.attributes){
                rfc[property] = tag.attributes[property];
            }
        } else if (tag.name === 'ItemList') {
            Itemlist_tag +=2;
        } else if (tag.name === 'Item') {
            Item_tag +=2;
            if (tag.attributes.name) {
                var item = tag.attributes.name;
                if (tag.attributes.index) {
                    if (!itemList[item]) {
                        itemList[item] = [];
                    }
                    currentObject.itemName = item;
                    currentObject.indexNo = tag.attributes.index;
                    currentObject.properties = {};
                    for (property in tag.attributes){
                        if (property !== 'name') {
                            currentObject.properties[property] = tag.attributes[property];
                        }
                    }
                } else {
                    itemList[item] = {'value':''};
                    currentObject = itemList[item];
                    for (property in tag.attributes){
                        if (property !== 'name') {
                            itemList[item][property] = tag.attributes[property];
                        }
                    }
                }
            } else {                   // name is a mandatory attribute
                // console.log('found item without a name in the WPI message:', tag);
            }
        } else {
            // console.log('Unknown opening tag in the WPI message:', tag);
        }
    };

    parser.onclosetag = function (tagName) {
        var property;
        // Dereference the current object after the text is added to the previous curren object
        currentObject = {};

        if (tagName === 'DLSMessage') {
            WPI_tag -= 1;
        } else if (tagName === 'Message') {
            Message_tag -= 1;
        } else if (tagName === 'Action') {
            Rfc_tag -= 1;
        } else if (tagName === 'ItemList') {
            Itemlist_tag -= 1;
        } else if (tagName === 'Item') {
            Item_tag -= 1;
        } else {
            // console.log('Unknown closing tag in the WPI message:', tagName);
        }
    };

    parser.ontext = function (text) {
        var property;
        if (currentObject) {
            if (currentObject.indexNo){
                var obj = {};
                obj.value = text;
                for (property in currentObject.properties){
                    if (property !== 'name') {
                        obj[property] = currentObject.properties[property];
                    }
                }
                itemList[currentObject.itemName].push(obj);
            } else {
                currentObject.value = text;
            }
        }
    };

    parser.onend = function () {
        var wpiObj = {'isWPI': false};
        // console.log('Done Parsing the WPI XML string');
        // console.log('WPI Tag:', WPI_tag);
        // console.log('RFC Tag:', Rfc_tag);
        // console.log('ItemList Tag:', Itemlist_tag);
        // console.log('Message_tag:', Message_tag);
        if (WPI_tag === 1 && Rfc_tag === 1 && (Itemlist_tag === 1) || ((Itemlist_tag === 0)) && (Message_tag === 1)) {
            wpiObj.isWPI = true;
            wpiObj.message = message;
            wpiObj.rfc = rfc;
            wpiObj.itemList = itemList;
            if (itemList['mac-addr']){
                wpiObj.id = itemList['mac-addr'].value;
            } else {
                // console.log('Missing MAC address from incoming WPI message');
            }
        } else {
            wpiObj.isWPI = false;
            // console.log ('This seems to be a non valid WPI message:', wpiObj);
        }
        // console.log ('Parsing Result: ', wpiObj);
        callback(wpiObj);  // return parsed object
    };

    parser.write(xml).end();
};

module.exports = wpiParser;

/*
wpiParser(src,function(wpiObj){
     console.log('Object:',wpiObj);
})*/
