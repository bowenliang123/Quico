'use strict';

console.log('background.js');

var latestUrl;


var ports = [];
//监听长时间连接
chrome.extension.onConnect.addListener(function (port) {
    console.log('onConnect:');
    console.log(port);
    if (port.name == 'main') {
        //发送最新 url
        if (latestUrl !== undefined) {
            port.postMessage({
                action: 'updateUrl',
                url: latestUrl
            });
        }

        //加入到广播队列中
        ports.push(port);
    }

    //onDisconnect 响应连接断开
    port.onDisconnect.addListener(function (msg) {
        //标记连接断开
        port.isDisconnected = true;
    });
});


//监听标签变化
//https://developer.chrome.com/extensions/tabs#event-onActivated
chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        console.log(tab);
        latestUrl = tab.url;
        //广播更新
        ports.forEach(function (port) {
            //检查连接是否已断开
            if (!port.isDisconnected) {
                //发送 url 更新信息
                port.postMessage({
                    action: 'updateUrl',
                    url: latestUrl
                });
            }
        });
    });
});