/**
 * Created by bowen on 16/3/11.
 */
'use strict';

console.log('popup.js');

//变量
var qrcodeElement;
var currentUrl; //当前页面 URL

//获取当前窗口URL
chrome.tabs.query({active: true, currentWindow: true}, function (tabArray) {

    currentUrl = tabArray[0].url;

    //生成二维码显示到canvas
    displayQrcode(currentUrl);
});


/**
 * 生成并显示二维码
 * @param url
 */
function displayQrcode(url) {
    if (qrcodeElement == undefined) {
        qrcodeElement = initQrcodeGenerator('qrcode', 200);
    }

    qrcodeElement.makeCode(url);
}

//按钮事件 - 主页面按钮
var qrcodeDiv = document.getElementById("qrcode");
qrcodeDiv.addEventListener('click', function (event) {
    event.preventDefault();

    //用新标签打开主面板页
    chrome.tabs.create({
        url: 'html/main.html?url=' + encodeURIComponent(currentUrl)
    });
});


//按钮事件 - 主页面按钮
let mainBtn = document.getElementById("btn-main");
mainBtn.addEventListener('click', function (event) {
    event.preventDefault();

    //用新标签打开主面板页
    chrome.tabs.create({
        url: 'html/main.html?url=' + encodeURIComponent(currentUrl)
    });
});


//按钮事件 - 点击下载按钮
let downloadBtn = document.getElementById("btn-download");
downloadBtn.addEventListener('click', function (event) {
    event.preventDefault();

    let canvas = $('#qrcode canvas').get(0);
    let base64QrImg = canvas.toDataURL();
    invokeDownloadQrImgFile(base64QrImg);
});