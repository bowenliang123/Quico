/**
 * Created by uc on 2016/3/11.
 */
'use strict';
console.info('main.js');

var qrcode;

var port;


initConnctionToBackground(port);

/**
 * 向背景页建立连接, 以及加上事件响应
 * @returns {*|{server}}
 */
function initConnctionToBackground(port) {
    port = chrome.runtime.connect({name: 'main'});

    console.info('connected to background.');

    //响应断开, 自动重连
    port.onDisconnect.addListener(function () {
        console.warn('background connection onDisconnect. trying to reconnect.');

        //重连
        initConnctionToBackground(port);
    });

    //响应消息
    port.onMessage.addListener(function (msg) {

        console.log('onMessage', msg.action, msg.tab.url);

        if (msg.action == 'updateTab') {

            var tab = msg.tab;

            //忽略非页面链接
            if (!tab.url.match(/^http/i)) {
                return;
            }

            //更新二维码
            displayQrcode(tab.url);

            displayMetaInfo(tab.title, tab.url);

        }
    });
    return port;
}


/**
 * 生成并渲染二维码
 * @param url
 */
function displayQrcode(url) {
    if (qrcode == undefined) {
        qrcode = initQrcodeGenerator('qrcode', 250);
    }

    //重绘
    qrcode.makeCode(url);
}


/**
 * 显示标题和 URL
 * @param title
 * @param url
 */
function displayMetaInfo(title, url) {
    document.getElementById("tabTitle").innerHTML = title;
    document.getElementById("tabUrl").innerHTML = url;
}