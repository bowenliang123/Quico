/**
 * Created by bowen on 16/3/11.
 */

console.log('popup.js');

//获取当前窗口URL
chrome.tabs.query({active: true, currentWindow: true}, function (tabArray) {
    var currentTab = tabArray[0];

    console.log(currentTab);

    var targetUrl = currentTab.url;
    var title = currentTab.title;

    //生成二维码显示到canvas
    generateQrcode(targetUrl);

    //显示网址
    showUrl(title, targetUrl);
});


function generateQrcode(url) {
    var qrcode = new QRCode(document.getElementById("qrcode"), {
        text: url,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

function showUrl(title, url) {
    document.getElementById("tabTitle").innerHTML = title;
    document.getElementById("tabUrl").innerHTML = url;
}


//按钮事件 - 主页面按钮
var mainBtn = document.getElementById("btn-main");
mainBtn.addEventListener('click', function (event) {
    event.preventDefault();

    //用新标签打开主面板页
    chrome.tabs.create({
        url: 'html/main.html'
    });
});
