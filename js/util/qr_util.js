/**
 * Created by bowen on 16/3/12.
 */
'use strict';

/**
 * 初始化二维码生成器
 * @param elementId
 * @param side
 * @returns {QRCode}
 */
function initQrcodeGenerator(elementId, side) {
    //console.log('initQrcodeGenerator');

    let element = document.getElementById(elementId);
    if (element == null) {
        element = document.createElement('div');
        element.id = elementId;
        element.style.display = 'none';
        document.body.appendChild(element);
    }

    //默认二维码参数
    let defaults = {
        side: 128,  //边长
        colorDark: "#000000",    //深色
        colorLight: "#ffffff",  //浅色
        correctLevel: QRCode.CorrectLevel.L
    };

    //初始化二维码生成器
    return new QRCode(element, {
        width: (side != undefined) ? side : defaults.side,
        height: (side != undefined) ? side : defaults.side,
        colorDark: defaults.colorDark,
        colorLight: defaults.colorLight,
        correctLevel: defaults.correctLevel
    });
}

/**
 * 触发下载二维码文件
 * @param base64img
 */
function invokeDownloadQrImgFile(url, base64img) {

    //准备canvas画布
    let canvas = document.getElementById('downloadCanvas');
    let ctx = canvas.getContext("2d");
    let image = new Image();

    image.onload = function () {
        let canvasWidth = 700;
        let canvasHeight = 300;
        let qrCodePadding = 7;
        let qrCodeMargin = 25;
        let qrCodeLength = 250;
        let lineWidth = 1;
        let urlFontPxSize = 16;
        let textX = qrCodeLength + qrCodeMargin * 2;
        let textY = qrCodeMargin + urlFontPxSize - 10;
        let textLen = 40;
        let textMaxWidth = (textLen - 2) * urlFontPxSize - 10;

        //渲染背景颜色
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        //渲染二维码外框
        ctx.strokeStyle = "#a8a8a8";
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(qrCodeMargin - qrCodePadding, qrCodeMargin - qrCodePadding, qrCodeLength + qrCodePadding * 2, qrCodeLength + qrCodePadding * 2);

        //渲染二维码
        ctx.drawImage(image, qrCodeMargin, qrCodeMargin);

        //渲染插件信息
        ctx.fillStyle = "#a8a8a8";      //文本颜色
        let textAMaxWidth = 380;
        let now = new Date();
        let shuiyin = `Generated by Quico Chrome Extension. ${now.getFullYear()}-${('0' + (now.getMonth() + 1)).slice(-2)}-${('0' + now.getDate()).slice(-2)} ${('0' + now.getHours()).slice(-2)}:${('0' + now.getMinutes()).slice(-2)}`;
        ctx.font = "10px Menlo, Monaco, Consolas, Courier, monospace";      //文本字体
        ctx.fillText(shuiyin,
            canvasWidth - urlFontPxSize - textAMaxWidth,
            canvasHeight - 20,
            textAMaxWidth);  //渲染网址

        //渲染网址
        ctx.fillStyle = "#3333ff";      //文本颜色
        ctx.font = urlFontPxSize + "px Menlo, Monaco, Consolas, Courier, monospace";      //文本字体
        let index = 0;
        while (index < url.length) {
            let end = index + textLen;
            let text = url.substr(index, textLen);
            ctx.fillText(text, textX, textY, textMaxWidth);  //渲染网址
            textY = textY + 25;
            index = end;
        }

        //初始化链接
        let downloadLink = document.createElement("a");

        //用 base64 生成 url
        downloadLink.href = canvas.toDataURL().replace(/^data:image\/[^;]/, 'data:application/octet-stream');

        //文件名
        downloadLink.download = `Quico二维码 ${url}.png`;

        //加入到文档中
        document.body.appendChild(downloadLink);

        //下载
        downloadLink.click();

        //清理
        document.body.removeChild(downloadLink);
    };
    image.src = base64img;


}