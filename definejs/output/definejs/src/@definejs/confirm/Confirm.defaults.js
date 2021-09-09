/**
* src: @definejs/confirm/modules/Confirm.defaults.js
* pkg: @definejs/confirm@1.0.1
*/
define('Confirm.defaults', function (require, module, exports) { 
    
    
    const Dialog = require('Dialog');
    
    /**
    * Confirm 模块的默认配置。
    * @name Confirm.defaults
    */
    module.exports = {
        Dialog, //移动端的会传入一个移动版的 Dialog。
    
        /**
        * 组件高度。
        * 可以指定为百分比的字符串，或指定具体的数值（单位为像素），
        */
        mask: true,
        height: 140,
        autoClose: true,
        volatile: false,
    
        'z-index': 99999,
    
        buttons: [
            { text: '确定', cmd: 'ok', cssClass: 'OK', },
            { text: '取消', cmd: 'cancel', cssClass: 'Cancel' },
        ],
    };
});