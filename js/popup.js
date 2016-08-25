/**
 * Created by bowen on 16/3/11.
 */
'use strict';

console.log('popup.js');

//变量
let qrcodeElement;
let currentUrl; //当前页面 URL

let qrcode;


initPopup();

function initPopup() {
    //获取当前窗口URL
    chrome.tabs.query({active: true, currentWindow: true}, (tabArray) => {

        currentUrl = tabArray[0].url;

        //生成二维码显示到canvas
        document.getElementById('qrcodeImage').src = displayQrcode2(currentUrl);
    });
}


/**
 * 生成并渲染二维码
 * @param url
 */
function displayQrcode2(url) {
    if (qrcode == undefined) {
        qrcode = initQrcodeGenerator('qrcode', 250);
    }

    //重绘
    qrcode.makeCode(url);

    let canvas = document.getElementsByTagName('canvas')[0];
    let base64QrImg = canvas.toDataURL();
    return base64QrImg;
}

//按钮事件 - 主页面按钮
let qrcodeDiv = document.getElementById("qrcodeImage");
qrcodeDiv.addEventListener('click', (event) => {
    event.preventDefault();

    //用新标签打开主面板页
    chrome.tabs.create({
        url: 'html/main.html?url=' + encodeURIComponent(currentUrl)
    });
});


//按钮事件 - 主页面按钮
let mainBtn = document.getElementById("btn-main");
mainBtn.addEventListener('click', (event) => {
    event.preventDefault();

    //用新标签打开主面板页
    chrome.tabs.create({
        url: 'html/main.html?url=' + encodeURIComponent(currentUrl)
    });
});


//按钮事件 - 点击下载按钮
let downloadBtn = document.getElementById("btn-download");
downloadBtn.addEventListener('click', (event)=> {
    event.preventDefault();

    let canvas = document.getElementsByTagName('canvas')[0];
    let base64QrImg = canvas.toDataURL();
    invokeDownloadQrImgFile(currentUrl, base64QrImg);
});

//按钮事件 - 点击快捷按钮
let downloadDeck = document.getElementById("btn-deck");
downloadDeck.addEventListener('click', (event)=> {
    event.preventDefault();

    //用新标签打开快捷面板
    chrome.tabs.create({
        url: 'html/deck.html'
    });
});