/**
* src: @definejs/loading/modules/Loading/Meta.js
* pkg: @definejs/loading@1.0.0
*/
define('Loading/Meta', function (require, module, exports) { 
    
    const $String = require('String');
    
    const prefix = 'definejs-loading-';     //用于生成组件 id 的前缀部分。
    const suffix = 4;                       //用于生成组件 id 的随机部分的长度。
    
    
    module.exports = {
        /**
        * 
        */
        create(config, others) {
            let id = $String.randomId(prefix, suffix);
            let textId = $String.randomId(prefix, 'text-', suffix);
    
    
            let meta = {
                'id': id,
                'textId': textId,
                'text': config.text || '',
                'cssClass': config.cssClass || '',
                'container': config.container,
                'duration': config.duration || 0,
    
                'sample': '',
                'masker': null,             // Masker 的实例，重复使用。
                'style': null,              //样式对象。
                'emitter': null,            //事件驱动器。
                'this': null,               //当前实例，方便内部使用。
                '$': null,                  //组件最外层的 DOM 节点的 jQuery 实例。
                '$text': null,              //$(textId)。
    
            };
    
    
    
    
            Object.assign(meta, others);
    
    
            return meta;
    
    
        },
    };
});