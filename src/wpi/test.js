'use strict';

var createInvChanges =   require( __dirname + '/wpiObject').invChages;
var createStartUp =   require( __dirname + '/wpiObject').startUp;
var createReplyToWrite =   require( __dirname + '/wpiObject').replyToWrite;
var wpiMsgTemplate = require( __dirname + '/wpiMessageTemplate');

var Device = require(__dirname + '/../deviceObj').deviceObject;

var parser = require( __dirname + '/wpiParser');

var device = new Device()

var wpiMsg = createReplyToWrite(device);
var wpiMsg = createStartUp(device);
var wpiMsg = createInvChanges(device);


var wpiMsg1 =  '<?xml version="1.0" encoding="UTF-8"?> '+
'    <Signature xmlns="http://www.w3.org/2000/09/xmldsig#"> '+
'    <SignedInfo>                                             '+
'        <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"></CanonicalizationMethod>'+
'        <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"></SignatureMethod>                    '+
'        <Reference URI="#DLSMessage">                                                                                 '+
'            <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></DigestMethod>                          '+
'            <DigestValue>S2l0gKal1UrGuc/G8UZTg18dPFc=</DigestValue>                                                    '+
'        </Reference>                                                                                                    '+
'    </SignedInfo>                                                                                                        '+
'    <SignatureValue>                                                                                                   '+
'    JiGs9fGWU3+o2B6oUprrG9sU1aHOxOEpnyhrSEVgbX8jFu2Wbd+UcP9OgsDhxG2NPMqLqLueQmGH xs4jMTLnVdVkU6wg964cLyBXk6sa3HmZrggvfHMfXEH+7H+HNQD+qOS4VYWztYUjEHzVAD0uPxrffXttppxW92P0EYW7O/Y='+
'    </SignatureValue>'+
'        <Object Id="DLSMessage"><DLSMessage xmlns="http://www.siemens.com/DLS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.siemens.com/DLS">'+
'            <Message nonce="CAA836D42B58A6D7DA134F5DFAACAA64">'+
'                <Action>WriteItems</Action>'+
'                <ItemList>'+
'                    <Item name="sip-mobility-state" status="secure">0</Item>'+
'                    <Item name="refuse-call">false</Item>'+
'    <Item index="38" name="locked-config-menus">false</Item>'+
'    <Item index="39" name="locked-config-menus">false</Item>'+
'   <Item index="40" name="locked-config-menus">false</Item>'+
'                   <Item name="callback-cancel-allow">false</Item>'+
'                    <Item name="callback-ring-allow">false</Item>'+
'                </ItemList>'+
'            </Message>'+
'        </DLSMessage></Object>'+
'   </Signature>'

console.log(parser(wpiMsg1, function (obj){ console.log(wpiMsgTemplate(obj))}));