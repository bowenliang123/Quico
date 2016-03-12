/**
 * Created by bowen on 16/3/11.
 */

console.log('popup.js');

//获取当前窗口URL
chrome.tabs.query({active: true, currentWindow: true}, function (tabArray) {
    var currentTab = tabArray[0];

    var currentUrl = currentTab.url;
    var currentTitle = currentTab.title;

    //生成二维码显示到canvas
    displayQrcode(currentUrl);

    //显示网址
    displayMetaInfo(currentTitle, currentUrl);
});


/**
 * 生成并显示二维码
 * @param url
 */
function displayQrcode(url) {
    let qrCodeBase64 = qr.toDataURL(url);
    console.log(qrCodeBase64);
    let qrcode_img = document.getElementById('qrcode-img');
    qrcode_img.src = qrCodeBase64;
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


//按钮事件 - 主页面按钮
var mainBtn = document.getElementById("btn-main");
mainBtn.addEventListener('click', function (event) {
    event.preventDefault();

    //用新标签打开主面板页
    chrome.tabs.create({
        url: 'html/main.html'
    });
});
