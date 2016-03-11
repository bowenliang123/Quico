'use strict';

console.log('content.js');

console.log(window.location);

//send reqeust to greet with background
chrome.extension.sendRequest(
    {greeting: "hello", location: window.location}
    , function (response) {
        console.log(response.farewell);
    });