'use strict';

console.log('background.js');

var latestTab;

var ports = [];
//监听长时间连接
chrome.extension.onConnect.addListener(function (port) {
    //console.log(port);

    if (port.name == 'main') {
        //发送最新 url
        if (latestTab !== undefined) {
            port.postMessage({
                action: 'updateTab',
                tab: latestTab
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
        //console.log(tab);
        latestTab = tab;
        //广播更新
        getAlivePorts().forEach(function (port) {

            //发送 url 更新信息
            port.postMessage({
                action: 'updateTab',
                tab: latestTab
            });
        });
    });
});

function getAlivePorts() {
    if (ports == undefined || ports.length == 0) {
        return [];
    }

    return ports.filter(function (port) {
        //检查连接是否已断开
        return !port.isDisconnected;
    })
}