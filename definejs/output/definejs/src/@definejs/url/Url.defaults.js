/**
* src: @definejs/url/modules/Url.defaults.js
* pkg: @definejs/url@1.0.0
*/
define('Url.defaults', function (require, module, exports) { 
    /**
    * Url 模块的默认配置。
    * @name Url.defaults
    */
    module.exports = {
        //这里取当前页面的路径作为根地址。
        //注意：只适用于当前页面在根目录的情况。
        //IE10 及以下 location.origin 不存在。
        root() { 
            return `${location.protocol}//${location.host}${location.pathname.split('/').slice(0, -1).join('/')}/`;
        },
    
    };
});