'use strict';

console.log('background.js');

chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
        "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.greeting == "hello") {
            sendResponse({farewell: "goodbye"});
        }

        else {
            sendResponse({}); // snub them.
        }
    });

var ports = [];
//监听长时间连接
chrome.extension.onConnect.addListener(function (port) {
    console.log('onConnect:' + port.name);
    if (port.name != 'content') {
        ports.push(port);
    }
    console.log(ports);
    port.onDisconnect.addListener(function (msg) {
        port.isDisconnected = true;
    })
    port.onMessage.addListener(function (msg) {
        console.log(msg);
        if (msg.action == "updateUrl") {
            console.log(msg);
            ports.forEach(function (port) {
                if (!port.isDisconnected)
                    port.postMessage({url: msg.url});
            });
        }
    });
});