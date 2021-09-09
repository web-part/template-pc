/**
* src: @definejs/toast/modules/Toast/Style.js
* pkg: @definejs/toast@1.0.2
*/
define('Toast/Style', function (require, module, exports) { 
    const $Object = require('Object');
    const Style = require('Style');
    
    module.exports = {
        /**
        * 从配置对象中过滤出样式成员，并进行规范化处理。
        * 返回一个样式对象 {}。
        */
        get(config) {
            let obj = $Object.filter(config, ['height', 'width', 'z-index']);
            let style = Style.objectify(config.style);
    
            style = Style.merge(style, obj);
            style = Style.pixelize(style, ['height', 'width',]);
    
            return style;
        },
    
    };
    
    
    
    
});