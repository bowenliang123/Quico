/**
 * Created by bowen on 16/3/12.
 */
'use strict';

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


        var qrcode;
        var port;

        init();

        function init() {
            //初始化与背景页的链接
            initConnctionToBackground(port);

            //从 GET 参数中获取传入的 url
            getInputUrl();

            //刷新二维码显示
            refreshQrcodeImage();
        }

        /**
         * 从 GET 参数中获取传入的 url
         */
        function getInputUrl() {
            var inputUrl = getURLParameter('url');
            if (inputUrl == undefined) {
                return;
            }

            $scope.currentUrl = inputUrl;
            console.log('url from input query string' + $scope.currentUrl);
        }


        function refreshQrcodeImage(isRefreshUrlDeatils) {
            $scope.currentCase.base64img = displayQrcode($scope.currentUrl);

            if (isRefreshUrlDeatils != false) {
                let aNode = document.createElement('a');
                aNode.style.display = 'none';
                document.body.appendChild(aNode);
                aNode.href = $scope.currentUrl;

                $scope.currentBase = aNode.protocol.concat('//', aNode.host);
                $scope.currentPath = aNode.pathname.concat();
                $scope.currentQuery = aNode.search.slice(1, aNode.search.length).concat();
                $scope.currentHash = aNode.hash.slice(1, aNode.hash.length).concat();

                //拆解 param 字符串
                let keyValueArr = $scope.currentQuery.split('&');
                let tmpParams = [];
                for (let i = 0; i < keyValueArr.length; i++) {
                    let pair = keyValueArr[i].split('=');
                    let key = pair[0];
                    let value = pair[1];
                    tmpParams.push({key: key, value: value});
                }
                $scope.currentParams = tmpParams;

                //cleanup
                if (aNode != undefined) {
                    document.body.removeChild(aNode);
                }
            }
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


                //消息 - getAllQuicoBookmarks
                if (msg.action == 'getAllQuicoBookmarks') {
                    var quicoBookmarks = msg.bookmarks;


                    let loopBookmarkTrees = function (bookmarkNode) {
                        let hehe = [];
                        if (bookmarkNode.children == undefined) {
                            hehe.push({url: bookmarkNode.url, title: bookmarkNode.title});
                        } else {
                            bookmarkNode.children.forEach(function (bookmark) {
                                console.log(bookmark);
                                hehe = hehe.concat(loopBookmarkTrees(bookmark));
                            });
                        }

                        return hehe;
                    };

                    $scope.bookmarks = loopBookmarkTrees(quicoBookmarks);
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

        function getAllQuicoBookmarksFromBackground(port) {
            if (port == undefined) {
                return;
            }

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

        //鼠标点击 - 点击 clear 按钮
        $scope.onClickClear = function () {
            $scope.currentUrl = '';
            refreshQrcodeImage();
        };


        //鼠标点击 - 点击 下载二维码 按钮
        $scope.onClickDownloadBtn = function () {
            //触发下载二维码文件
            invokeDownloadQrImgFile($scope.currentCase.base64img);
        }
    });