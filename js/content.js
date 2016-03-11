'use strict';

console.log('content.js');

console.log(window.location);

//send reqeust to greet with background
chrome.extension.sendRequest(
    {greeting: "hello", location: window.location}
    , function (response) {
        console.log(response.farewell);
    });

var port = chrome.extension.connect({name: 'content'});
port.postMessage({action: "updateUrl", url: window.location.href});