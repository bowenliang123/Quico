/**
 * Created by bowen on 16/3/12.
 */

var app = angular.module('quicoApp', [
    'mainCtrl'
]);

app.config([
    '$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|chrome|data):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
    }
]);