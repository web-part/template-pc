/**
* src: @definejs/toast/modules/Toast/Meta.js
* pkg: @definejs/toast@1.0.2
*/
define('Toast/Meta', function (require, module, exports) { 
    
    const IDMaker = require('IDMaker');
    
    
    
    module.exports = {
        create(config, others) {
            let maker = new IDMaker(config.idPrefix);
            let text = config.text;
    
            text = typeof text == 'number' ? String(text) : text;
            text = text || '';
    
    
            let meta = {
                'id': maker.next(),
                'icon': config.icon,
                'text': text,
                'textId': maker.next('text'),
                'iconId': maker.next('icon'),
                'cssClass': config.cssClass || '',
                'container': config.container,
                'duration': config.duration || 0,
                'sample': '',
                'style': '',                //样式字符串。
    
                'masker': null,             // Masker 的实例，重复使用。
                'emitter': null,            //事件驱动器。
                'this': null,               //当前实例，方便内部使用。
                '$': null,                  //组件最外层的 DOM 节点的 jQuery 实例。
                '$icon': null,              //$(iconId)。
                '$text': null,              //$(textId)。
    
            };
    
    
    
            Object.assign(meta, others);
    
    
            return meta;
    
    
        },
    };
});