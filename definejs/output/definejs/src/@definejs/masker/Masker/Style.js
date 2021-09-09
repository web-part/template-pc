/**
* src: @definejs/masker/modules/Masker/Style.js
* pkg: @definejs/masker@1.0.1
*/
define('Masker/Style', function (require, module, exports) { 
    const $Object = require('Object');
    const Style = require('Style');
    
    /**
    *
    */
    module.exports = {
        /**
        * 从配置对象中过滤出样式成员，并进行规范化处理。
        * 返回一个样式对象 {}。
        */
        get(config) {
            let obj = $Object.filter(config, ['opacity', 'z-index']);
            let style = Style.objectify(config.style);
    
            style = Style.merge(style, obj);
    
            return style;
    
        },
    };
});