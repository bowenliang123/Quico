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

    //onDisconnect 响应连接断开
    port.onDisconnect.addListener(function (msg) {
        //标记连接断开
        port.isDisconnected = true;
    });

    //onMessage 响应消息请求
    port.onMessage.addListener(function (msg) {
        console.log(msg);
        if (msg.action == "updateUrl") {
            console.log(msg);

            //广播更新
            ports.forEach(function (port) {
                //检查连接是否已断开
                if (!port.isDisconnected) {
                    //发送 url 更新信息
                    port.postMessage({
                        action:'updateUrl',
                        url: msg.url
                    });
                }
            });
        }
    });
});