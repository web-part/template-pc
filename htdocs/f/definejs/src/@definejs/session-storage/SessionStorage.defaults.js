/**
* src: @definejs/session-storage/modules/SessionStorage.defaults.js
* pkg: @definejs/session-storage@1.0.0
*/
define('SessionStorage.defaults', function (require, module, exports) { 
    
    /**
    * SessionStorage 模块的默认配置
    * @name SessionStorage.defaults
    */
    module.exports = {
        /**
        * 应用的名称。
        * 设定后即可创建与获取在该名称下的本地存储，从而避免跟其它应用的冲突。
        */
        name: '',
    };
});