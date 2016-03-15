/**
 * Created by bowen on 16/3/15.
 */
'use strict';

/**
 * 从指定字符串中获取 GET 参数值,默认查找 location.search
 * @param name
 * @param searchStr
 * @returns {string|null}
 */
function getURLParameter(name, searchStr) {
    if (searchStr == undefined) {
        searchStr = location.search;
    }

    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(searchStr) || [, ""])[1].replace(/\+/g, '%20')) || null;
}