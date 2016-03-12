'use strict';

console.log('background.js');

var latestTab;

//main 页面连接
var portsToMain = [];

//监听长时间连接
chrome.runtime.onConnect.addListener(function (port) {
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
        portsToMain.push(port);
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
        getAlivePortsToMain().forEach(function (port) {

            //发送 url 更新信息
            port.postMessage({
                action: 'updateTab',
                tab: latestTab
            });
        });
    });
});

/**
 * 获取所有存活连接
 * @returns {Array}
 */
function getAlivePortsToMain() {
    if (portsToMain == undefined || portsToMain.length == 0) {
        return [];
    }


    //删除已断开的链接
    portsToMain = portsToMain.filter(function (port) {
        //检查连接是否已断开
        return !port.isDisconnected;
    });

    return portsToMain;
}