/**
* src: @definejs/app/modules/App.defaults.js
* pkg: @definejs/app@1.0.1
*/
define('App.defaults', function (require, module, exports) { 
    /**
    * App 模块的默认配置。
    * @name App.defaults
    */
    module.exports = {
        //针对移动端的。
        ViewSlider: null,   
        /**
        * 应用的根节点模块，一般建议保留为空字符串。
        */
        root: '',
        /**
        * 应用的唯一名称。
        * 用于在存储中区分其它应用。
        */
        name: '',
        seperator: '/',
        navigator: 'app-default-navigator',
        /**
        * 针对视图的配置。
        */
        view: { },
    };
    
    
});