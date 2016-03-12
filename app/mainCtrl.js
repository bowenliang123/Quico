/**
 * Created by bowen on 16/3/12.
 */
angular.module('mainCtrl', [])
    .controller('mainCtrl', function ($scope) {
        $scope.qrCodeList = [];
        $scope.latestTab = undefined;
        $scope.currentUrl = '';
        $scope.parser = undefined;


        var refreshQrcodeImage = function () {
            $scope.currentQrBase64 = displayQrcode($scope.currentUrl);

            $scope.parser = document.createElement('a');
            $scope.parser.href = $scope.currentUrl;

            //$scope.parser.protocol; // => "http:"
            //$scope.parser.hostname; // => "example.com"
            //$scope.parser.port;     // => "3000"
            //$scope.parser.pathname; // => "/pathname/"
            //$scope.parser.search;   // => "?search=test"
            //$scope.parser.hash;     // => "#hash"
            //$scope.parser.host;     // => "example.com:3000"

        };

        var qrcode;

        var port;


        initConnctionToBackground(port);

        refreshQrcodeImage();

        /**
         * 向背景页建立连接, 以及加上事件响应
         * @returns {*|{server}}
         */
        function initConnctionToBackground(port) {
            port = chrome.runtime.connect({name: 'main'});

            console.info('connected to background.');

            //响应断开, 自动重连
            port.onDisconnect.addListener(function () {
                console.warn('background connection onDisconnect. trying to reconnect.');

                //重连
                initConnctionToBackground(port);
            });

            //响应消息
            port.onMessage.addListener(function (msg) {

                console.log('onMessage', msg.action, msg.tab.url);

                if (msg.action == 'updateTab') {

                    var tab = msg.tab;

                    //忽略非页面链接
                    if (!tab.url.match(/^http/i)) {
                        return;
                    }

                    //更新二维码
                    let base64QrImg = displayQrcode(tab.url);
                    $scope.qrCodeList.unshift({url: tab.url, title: tab.title, base64QrImg: base64QrImg});
                    $scope.$apply();
                    //displayMetaInfo(tab.title, tab.url);

                }
            });
            return port;
        }


        /**
         * 生成并渲染二维码
         * @param url
         */
        function displayQrcode(url) {
            if (qrcode == undefined) {
                qrcode = initQrcodeGenerator('qrcode', 500);
            }

            //重绘
            qrcode.makeCode(url);

            let canvas = $('#qrcode canvas').get(0);
            let base64QrImg = canvas.toDataURL();
            return base64QrImg;
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


        $scope.onCurrentUrlChange = refreshQrcodeImage;

    });