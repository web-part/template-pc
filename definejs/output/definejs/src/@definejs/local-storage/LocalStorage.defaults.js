/**
* src: @definejs/local-storage/modules/LocalStorage.defaults.js
* pkg: @definejs/local-storage@1.0.0
*/
define('LocalStorage.defaults', function (require, module, exports) { 
    
    /**
    * LocalStorage 模块的默认配置
    * @name LocalStorage.defaults
    */
    module.exports = {
        /**
        * 应用的名称。
        * 设定后即可创建与获取在该名称下的本地存储，从而避免跟其它应用的冲突。
        */
        name: '',
    };
});