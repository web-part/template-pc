/**
* src: @definejs/app-module/modules/AppModule.defaults.js
* pkg: @definejs/app-module@1.0.0
*/
define('AppModule.defaults', function (require, module, exports) { 
    
    const Emitter = require('Emitter');
    
    
    module.exports = {
        Emitter,   //事件驱动器。
    
        seperator: '/',     //私有模块的分隔符。
        repeated: false,    //不允许重复定义同名的模块。
        cross: false,       //不允许跨级加载模块。
    };
});