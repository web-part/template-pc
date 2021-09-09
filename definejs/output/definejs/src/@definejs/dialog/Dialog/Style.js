/**
* src: @definejs/dialog/modules/Dialog/Style.js
* pkg: @definejs/dialog@1.0.4
*/
define('Dialog/Style', function (require, module, exports) { 
    const $Object = require('Object');
    const Style = require('Style');
    
    module.exports = {
        /**
        *
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