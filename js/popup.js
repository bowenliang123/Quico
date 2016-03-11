/**
 * Created by bowen on 16/3/11.
 */

console.log('popup.js');

//获取当前窗口URL
chrome.tabs.query({active: true, currentWindow: true}, function (tabArray) {
    var targetUrl = tabArray[0].url;

    //生成二维码显示到canvas
    generateQrcode(targetUrl);

    //显示网址
    showUrl(targetUrl);
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


function showUrl(url) {
    document.getElementById("urlText").innerHTML = url;
}