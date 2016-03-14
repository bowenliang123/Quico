'use strict';

console.log('background.js');


//main 页面连接
var portsToMain = [];

//监听长时间连接
chrome.runtime.onConnect.addListener(function (port) {
    //console.log(port);

    var latestTab = getLatestTab();
    if (port.name == 'main') {
        //发送 url 更新信息
        port.postMessage({
            action: 'updateTab',
            tab: latestTab
        });

        //加入到广播队列中
        portsToMain.push(port);
    }

    //响应消息
    port.onMessage.addListener(function (msg) {

        console.log('onMessage:');
        console.log(msg);

        if (msg.action == 'getAllQuicoBookmarks') {

            //获取所有 Quico 书签
            getQuicoBookmarks(function (results,quicoBookmarksRootNodeId) {
                port.postMessage({
                    action: 'getAllQuicoBookmarks',
                    bookmarks: results,
                    bookmarksRootId: quicoBookmarksRootNodeId
                });
            });
        }

    });


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

        //忽略非页面链接
        if (!tab.url.match(/^http/i)) {
            return;
        }


        //更新 latestTab
        saveLatestTab(tab);

        var latestTab = getLatestTab();

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


/**
 * 从 localstorage 读取最新 tab
 * @returns {undefined}
 */
function getLatestTab() {
    //读取 localstorage
    let latestTabStr = window.localStorage.getItem('latestTab');
    if (latestTabStr == undefined) {
        return undefined;
    }

    //反序列化
    return JSON.parse(latestTabStr);
}

/**
 * 存储最新 tab 到 localstorage
 * @param tab
 */
function saveLatestTab(tab) {
    if (tab == undefined) {
        return;
    }

    //序列化 tab 存入 localstorage
    window.localStorage.setItem('latestTab', JSON.stringify(tab));
}


/**
 * 获取 Quico Bookmarks 下所有书签
 * @param callback
 */
function getQuicoBookmarks(callback) {
    //查询标签
    chrome.bookmarks.search('Quico Bookmarks', function (bookmarkTreeNodes) {

        //若未找到则创建
        if (bookmarkTreeNodes == undefined || bookmarkTreeNodes.length == 0) {
            //创建, 模拟在'其他书签'(other bookmarks)文件夹中创建
            chrome.bookmarks.create({
                title: 'Quico Bookmarks'
            }, function (result) {
                //创建后再次尝试获取 Quico Bookmarks 下所有书签
                getQuicoBookmarks(callback);
            })
        } else {

            //获取 Quico Bookmarks 下所有书签
            var quicoBookmarksRootNodeId = bookmarkTreeNodes[0].id;
            chrome.bookmarks.getChildren(quicoBookmarksRootNodeId, function (results) {

                //cb
                callback(results, quicoBookmarksRootNodeId);
            });
        }
    });
}