/**
 * Created by uc on 2016/3/11.
 */
'use strict';

var qrcode;

var port = chrome.extension.connect({name: 'main'});
port.onMessage.addListener(function (msg) {
    console.log(msg);
    if (msg.action == 'updateUrl') {

        //忽略非页面链接
        if (!msg.url.match(/^http/i)) {
            return;
        }

        //更新二维码
        displayQrcode(msg.url);
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