/**
 * Created by bowen on 16/3/12.
 */

function initQrcodeGenerator(elementId, side) {
    //console.log('initQrcodeGenerator');

    let element = document.getElementById(elementId);
    if (element == null) {
        return;
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