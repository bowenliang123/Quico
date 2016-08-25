/**
 * Created by bowen on 16/3/12.
 */
'use strict';

angular.module('deckCtrl', [])
    .controller('deckCtrl', ($scope) => {
        var qrcode; //用于生成二维码的对象
        let reg = /^\[(\S+)\]\((\S+)\)$/mig;    //拆解二维码地址信息的正则表达式
        var deck_urls_key = 'deck.urls';    //chrome存储中的key-value


        $scope.urls = "";       //地址信息

        init();//执行初始化

        /**
         * 解析并展示URL
         */
        $scope.parseAndDisplayUrls = ()=> {

            $scope.urls = filterBlankUrls($scope.urls);

            // localStorage.setItem(urlsStorageKey, $scope.urls);
            persistUrls($scope.urls, ()=> {

                if (!$scope.urls || $scope.urls == '') {
                    return;
                }

                let arr;
                $scope.resultCases = [];
                while ((arr = reg.exec($scope.urls)) != null) {
                    console.log(arr);
                    let desc = arr[1];
                    let url = arr[2];

                    let obj = {
                        desc: arr[1],
                        url: arr[2],
                        base64img: displayQrcode(url)
                    };

                    $scope.resultCases.push(obj);
                }


                $scope.$apply();        //渲染
            });

        };

        /**
         * 生成并渲染二维码
         * @param url
         */
        function displayQrcode(url) {
            if (qrcode == undefined) {
                qrcode = initQrcodeGenerator('qrcode', 100);
            }

            //重绘
            qrcode.makeCode(url);

            let canvas = $('#qrcode canvas').get(0);
            let base64QrImg = canvas.toDataURL();
            return base64QrImg;
        }


        /**
         * 初始化
         */
        function init() {
            //恢复URL
            restoreUrls((urls)=> {
                $scope.urls = filterBlankUrls(urls);
                $scope.parseAndDisplayUrls();
            });
        }


        //过滤空白的urls地址,替换成默认地址
        function filterBlankUrls(urls) {
            return (urls && urls != '') ? urls : '[这里写名称](https://www.google.com/?#q=这里写URL)\n\n[谷歌](https://www.google.com)'
        }


        //持久化URL地址
        function persistUrls(urls, callback) {
            let obj = {};
            obj[deck_urls_key] = urls;

            chrome.storage.sync.set(obj, ()=> {
                (callback) && callback();
            })
        }


        /**
         * 从持久化层读出地址信息
         * @param callback
         */
        function restoreUrls(callback) {
            if (!callback) {
                return;
            }

            // var value = localStorage.getItem(urlsStorageKey);

            chrome.storage.sync.get(deck_urls_key, (items)=> {
                console.log(items);
                if (items) {
                    let urls = filterBlankUrls(items[deck_urls_key]);
                    (callback) && callback(urls);
                }
            });
        }

    });