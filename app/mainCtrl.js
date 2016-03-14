/**
 * Created by bowen on 16/3/12.
 */
angular.module('mainCtrl', [])
    .controller('mainCtrl', function ($scope) {
        $scope.qrCodeList = [];
        $scope.latestTab = undefined;
        $scope.currentUrl = '';
        $scope.parser = undefined;
        $scope.currentCase = {
            fullUrl: '',
            base: '',
            path: '',
            query: '',
            base64img: ''
        };


        let urlReg = /^(https?:\/\/[\w\d\-.]+)(\/?$|[\w\d\/\-.]+)\??([\w\d\-=%&]*)\#?(.*)/i;


        var qrcode;
        var port;

        init();

        function init() {
            //初始化与背景页的链接
            initConnctionToBackground(port);

            //刷新从后台获取的页面
            refreshQrcodeImage();
        }


        function refreshQrcodeImage(isRefreshUrlDeatils) {
            $scope.currentCase.base64img = displayQrcode($scope.currentUrl);

            if (isRefreshUrlDeatils != false) {
                let mathedArr = urlReg.exec($scope.currentUrl);
                if (mathedArr == null) {
                    //忽略非网址结构文本
                    return;
                }

                //组装
                $scope.currentBase = mathedArr[1];
                $scope.currentPath = mathedArr[2];
                $scope.currentQuery = mathedArr[3];
                $scope.currentHash = mathedArr[4];


                //拆解 param 字符串
                let arr = $scope.currentQuery.split('&');
                let tmpParams = [];
                for (let i = 0; i < arr.length; i++) {
                    let key = arr[i].split('=')[0];
                    let value = arr[i].split('=')[1];
                    tmpParams.push({key: key, value: value});
                }
                $scope.currentParams = tmpParams;
            }

            //$scope.currentCase.url = $scope.currentUrl;
            //$scope.currentCase.base64img = displayQrcode($scope.currentUrl);

            //解析地址结构
            //$scope.parser = document.getElementById('hiddenA');
            //$scope.parser.href = $scope.currentUrl;

            //$scope.parser.protocol; // => "http:"
            //$scope.parser.hostname; // => "example.com"
            //$scope.parser.port;     // => "3000"
            //$scope.parser.pathname; // => "/pathname/"
            //$scope.parser.search;   // => "?search=test"
            //$scope.parser.hash;     // => "#hash"
            //$scope.parser.host;     // => "example.com:3000"
        }

        /**
         * 向背景页建立连接, 以及加上事件响应
         * @returns {*|{server}}
         */
        function initConnctionToBackground(port) {
            port = chrome.runtime.connect({name: 'main'});

            console.info('connected to background.');

            //向背景页获取所有 Quico 标签
            getAllQuicoBookmarksFromBackground(port);


            //响应断开, 自动重连
            port.onDisconnect.addListener(function () {
                console.warn('background connection onDisconnect. trying to reconnect.');

                //重连
                initConnctionToBackground(port);
            });

            //响应消息
            port.onMessage.addListener(function (msg) {

                console.log('onMessage');
                console.log(msg);

                //消息 - updateTab
                if (msg.action == 'updateTab') {

                    let tab = msg.tab;

                    //忽略非页面链接
                    if (!tab.url.match(/^http/i)) {
                        return;
                    }

                    //更新二维码
                    let base64QrImg = displayQrcode(tab.url);
                    $scope.qrCodeList.unshift({url: tab.url, title: tab.title, base64QrImg: base64QrImg});
                    $scope.$apply();
                }


                //消息 - updateTab
                if (msg.action == 'getAllQuicoBookmarks') {
                    $scope.bookmarks = msg.bookmarks;
                    $scope.bookmarksRootId = msg.bookmarksRootId;
                    $scope.$apply();
                }

                //消息 -  bookmarksUpdated 背景页通知书签有变更
                if (msg.action == 'bookmarksUpdated') {
                    //向背景页获取所有 Quico 标签
                    getAllQuicoBookmarksFromBackground(port);
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


        function getAllQuicoBookmarksFromBackground(port) {
            //if (port == undefined) {
            //    return;
            //}

            port.postMessage({action: 'getAllQuicoBookmarks'});
        }


        //事件注册
        $scope.onChangeUrlTexteara = refreshQrcodeImage;

        $scope.onChangeUrlDetails = function (isRefreshUrlDeatils) {

            let newUrl = [
                $scope.currentBase,
                $scope.currentPath,
                ($scope.currentQuery == '') ? '' : ('?' + $scope.currentQuery),
                ($scope.currentHash == '') ? '' : ('#' + $scope.currentHash)
            ].join('');

            $scope.currentUrl = newUrl;

            refreshQrcodeImage(isRefreshUrlDeatils);
        };


        $scope.onClickRecentUrls = function (url) {
            $scope.currentUrl = url;
            refreshQrcodeImage();
        };


        $scope.onChangeParams = function (index) {

            //忽略字符串为空的时候
            if ($scope.currentParams == undefined || $scope.currentParams.length == 0) {
                return;
            }

            //拼接 query 字符串
            let newQueryStr = '';
            $scope.currentParams.forEach(function (param) {
                newQueryStr = newQueryStr.concat(param.key, '=', param.value, '&');
            });
            newQueryStr = newQueryStr.slice(0, newQueryStr.length - 1)

            //更新 query 字符串
            $scope.currentQuery = newQueryStr;

            //刷新 url 详情和二维码
            $scope.onChangeUrlDetails(false);
        };


        //鼠标点击 - 点击 quico 书签标题
        $scope.openQuicoBookmarksInNewTab = function () {
            chrome.tabs.create({url: 'chrome://bookmarks/#' + $scope.bookmarksRootId});
        };
    });