/**
 * Created by uc on 2016/3/11.
 */
'use strict';
console.info('main.js');

var qrcode;

var port = chrome.extension.connect({name: 'main'});
port.onMessage.addListener(function (msg) {

    //console.log(msg);

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