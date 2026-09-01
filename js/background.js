'use strict';

console.log('background.js');


//变量

//main 页面连接
var portsToMain = [];

//chrome.storage 中的 key
var latestTabKey = 'latestTab';

//右键菜单 id
var contextMenuId = 'quico-generate-qrcode';

//初始化
init();

/**
 * 初始化
 */
function init() {
    //响应长时间链接和消息处理
    handleRuntimeConnnection();

    //监听标签变化
    listenTabChange();

    //监听书签变化
    listenBookmarksChange();

    //监听插件安装/更新事件 (service worker 每次唤醒都会执行顶层代码, 菜单只能在 onInstalled 中创建)
    chrome.runtime.onInstalled.addListener(() => {
        createContextMenu();
    });
}

/**
 * 创建右键菜单
 * MV3 移除了 contextMenus.create 的 onclick 参数, 需配合 contextMenus.onClicked 事件使用
 */
function createContextMenu() {
    chrome.contextMenus.create({
        id: contextMenuId,
        title: 'Generate QR code'
    }, () => {
        //忽略 chrome.runtime.lastError (菜单已存在时), 避免报错
        void chrome.runtime.lastError;
    });
}

function handleRuntimeConnnection() {
    //监听长时间连接
    chrome.runtime.onConnect.addListener((port) => {
        //console.log(port);

        if (port.name == 'main') {
            //发送 url 更新信息
            getLatestTab((latestTab) => {
                //连接可能在读取完成前断开
                if (port.isDisconnected) {
                    return;
                }

                port.postMessage({
                    action: 'updateTab',
                    tab: latestTab
                });
            });

            //加入到广播队列中
            portsToMain.push(port);
        }

        //响应消息
        port.onMessage.addListener((msg) => {

            console.log('onMessage:');
            console.log(msg);

            if (msg.action == 'getAllQuicoBookmarks') {

                //获取所有 Quico 书签
                getQuicoBookmarks((results, quicoBookmarksRootNodeId) => {
                    port.postMessage({
                        action: 'getAllQuicoBookmarks',
                        bookmarks: results,
                        bookmarksRootId: quicoBookmarksRootNodeId
                    });
                });
            }

        });


        //onDisconnect 响应连接断开
        port.onDisconnect.addListener((msg) => {
            //标记连接断开
            port.isDisconnected = true;
        });
    });
}

/**
 * 监听标签变化
 */
function listenTabChange() {
    //监听标签变化
    //https://developer.chrome.com/docs/extensions/reference/api/tabs#event-onActivated
    chrome.tabs.onActivated.addListener((activeInfo) => {
        chrome.tabs.get(activeInfo.tabId, (tab)=> {
            //console.log(tab);

            //忽略非页面链接
            if (!tab.url || !tab.url.match(/^http/i)) {
                return;
            }


            //更新 latestTab
            saveLatestTab(tab);

            //读取 latestTab 后广播更新
            getLatestTab((latestTab) => {

                //广播更新
                getAlivePortsToMain().forEach((port) => {

                    //发送 url 更新信息
                    port.postMessage({
                        action: 'updateTab',
                        tab: latestTab
                    });
                });
            });
        });
    });
}

/**
 * 监听 chrome 全局书签变化, 并通知 main
 */
function listenBookmarksChange() {
    //通知 main 面板
    function notifyMainPorts() {
        //广播更新
        getAlivePortsToMain().forEach((port) => {
            //发送 url 更新信息
            port.postMessage({
                action: 'bookmarksUpdated'
            });
        });
    }

    //监听 chrome 全局书签变化
    chrome.bookmarks.onCreated.addListener(notifyMainPorts);
    chrome.bookmarks.onRemoved.addListener(notifyMainPorts);
    chrome.bookmarks.onChanged.addListener(notifyMainPorts);
    chrome.bookmarks.onMoved.addListener(notifyMainPorts);
    chrome.bookmarks.onImportBegan.addListener(notifyMainPorts);
    chrome.bookmarks.onImportEnded.addListener(notifyMainPorts);
}


/**
 * 获取所有存活连接
 * @returns {Array}
 */
function getAlivePortsToMain() {
    if (portsToMain == undefined || portsToMain.length == 0) {
        return [];
    }


    //删除已断开的链接
    portsToMain = portsToMain.filter((port)=> {
        //检查连接是否已断开
        return !port.isDisconnected;
    });

    return portsToMain;
}


/**
 * 从 chrome.storage.local 读取最新 tab
 * MV3 的 service worker 中没有 window/localStorage, 改用 chrome.storage
 * @param callback
 */
function getLatestTab(callback) {
    chrome.storage.local.get(latestTabKey, (items) => {
        callback(items ? items[latestTabKey] : undefined);
    });
}

/**
 * 存储最新 tab 到 chrome.storage.local
 * @param tab
 */
function saveLatestTab(tab) {
    if (tab == undefined) {
        return;
    }

    let obj = {};
    obj[latestTabKey] = tab;

    chrome.storage.local.set(obj);
}


/**
 * 获取 Quico Bookmarks 下所有书签
 * @param callback
 */
function getQuicoBookmarks(callback) {
    //查询标签
    chrome.bookmarks.search('Quico Bookmarks', (bookmarkTreeNodes)=> {

        //若未找到则创建
        if (bookmarkTreeNodes == undefined || bookmarkTreeNodes.length == 0) {
            //创建, 模拟在'其他书签'(other bookmarks)文件夹中创建
            chrome.bookmarks.create({
                title: 'Quico Bookmarks'
            }, (result) => {
                //创建后再次尝试获取 Quico Bookmarks 下所有书签
                getQuicoBookmarks(callback);
            })
        } else {

            //获取 Quico Bookmarks 下所有书签
            let quicoBookmarksRootNodeId = bookmarkTreeNodes[0].id;
            chrome.bookmarks.getSubTree(quicoBookmarksRootNodeId, (results)=> {

                //cb
                callback(results[0], quicoBookmarksRootNodeId);
            });
        }
    });
}


//监听插件安装事件
//https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onInstalled
//chrome.runtime.onInstalled.addListener(() => {
//    //用新标签打开主面板页
//    chrome.tabs.create({
//        url: 'html/main.html?url=' + encodeURIComponent('http://www.domain.com/index?author=BowenLiang&extension=Quico#efficiencyFirst')
//    });
//});


//响应右键菜单点击
//MV3 移除了 contextMenus.create 的 onclick 回调, 统一由 onClicked 事件处理
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId != contextMenuId || !tab || !tab.url) {
        return;
    }

    //用新标签打开主面板页
    chrome.tabs.create({
        url: 'html/main.html?url=' + encodeURIComponent(tab.url)
    });
});


//添加 omnibox 命令响应
//https://developer.chrome.com/docs/extensions/reference/api/omnibox#event-onInputEntered
chrome.omnibox.onInputEntered.addListener((text, disposition) => {
    //用新标签打开主面板页
    chrome.tabs.create({
        url: 'html/main.html?url=' + encodeURIComponent(text)
    });
});
