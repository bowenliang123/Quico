/**
 * Created by uc on 2016/3/11.
 */
var port = chrome.extension.connect({name:'main'});
port.onMessage.addListener(function(msg) {
    console.log(msg);
    generateQrcode(msg.url);
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