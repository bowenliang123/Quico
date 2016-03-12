/**
 * Created by uc on 2016/3/11.
 */
var port = chrome.extension.connect({name: 'main'});
port.onMessage.addListener(function (msg) {
    console.log(msg);
    if (msg.action == 'updateUrl') {
        displayQrcode(msg.url);
    }
});


/**
 * 生成并渲染二维码
 * @param url
 */
function displayQrcode(url) {
    let qrCodeBase64 = qr.toDataURL({level: 'L', value: url});
    //console.log(qrCodeBase64);

    //渲染二维码到 img 标签中
    let qrcode_img = document.getElementById('qrcode-img');
    qrcode_img.src = qrCodeBase64;

    return qrCodeBase64;
}