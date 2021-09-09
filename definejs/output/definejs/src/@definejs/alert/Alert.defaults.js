/**
* src: @definejs/alert/modules/Alert.defaults.js
* pkg: @definejs/alert@1.0.2
*/
define('Alert.defaults', function (require, module, exports) { 
    
    const Dialog = require('Dialog');
    
    
    /**
    * Alert 模块的默认配置
    * @name Alert.defaults
    */
    module.exports = {
        Dialog, //这里提供一个默认的，移动端的会传入一个移动版的 Dialog。
    
        volatile: false,
        mask: true,
        autoClose: true,
        width: 450,
    
        'z-index': 99999,
    
        buttons: [
            { text: '确定', cmd: 'ok', cssClass: 'OK', },
        ],
    };
});