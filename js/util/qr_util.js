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
        //渲染背景颜色
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 600, 280);

        //渲染二维码
        let imageMargin=15;
        ctx.drawImage(image, imageMargin, imageMargin);

        //渲染网址
        ctx.fillStyle = "#0066ff";      //文本颜色
        let fontPxSize = 20;
        ctx.font = fontPxSize + "px monospace";      //文本字体
        let textX = 280;
        let textY = imageMargin+fontPxSize;
        let textMaxWidth = 320 - fontPxSize;
        let index = 0;
        let len = 25;
        while (index < url.length) {
            let end = index + len;
            let text = url.substr(index, len);
            ctx.fillText(text, textX, textY, textMaxWidth);  //渲染网址
            textY = textY + 25;
            index = end;
        }

        //初始化链接
        let downloadLink = document.createElement("a");

        //用 base64 生成 url
        downloadLink.href = canvas.toDataURL().replace(/^data:image\/[^;]/, 'data:application/octet-stream');

        //文件名
        downloadLink.download = `Quico ${url}.png`;

        //加入到文档中
        document.body.appendChild(downloadLink);

        //下载
        downloadLink.click();

        //清理
        document.body.removeChild(downloadLink);
    };
    image.src = base64img;


}