/**
* src: @definejs/script/modules/Script.defaults.js
* pkg: @definejs/script@1.0.0
*/
define('Script.defaults', function (require, module, exports) { 
    
    module.exports = {
        url: '',
        id: '',
        charset: 'utf-8',
        document: window.document,
        onload: null,
    };
});