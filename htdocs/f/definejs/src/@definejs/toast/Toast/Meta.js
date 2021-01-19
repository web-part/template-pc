/**
* src: @definejs/toast/modules/Toast/Meta.js
* pkg: @definejs/toast@1.0.0
*/
define('Toast/Meta', function (require, module, exports) { 
    
    const $String = require('String');
    
    const prefix = 'definejs-toast-';     //用于生成组件 id 的前缀部分。
    const suffix = 4;                     //用于生成组件 id 的随机部分的长度。
    
    
    
    module.exports = {
        create(config, others) {
            let id = $String.randomId(prefix, suffix);
            let textId = $String.randomId(prefix, 'text-', suffix);
            let iconId = $String.randomId(prefix, 'icon-', suffix);
            let text = config.text;
    
            text = typeof text == 'number' ? String(text) : text;
            text = text || '';
    
    
            let meta = {
                'id': id,
                'icon': config.icon,
                'text': text,
                'textId': textId,
                'iconId': iconId,
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