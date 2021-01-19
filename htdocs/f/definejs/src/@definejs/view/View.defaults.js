/**
* src: @definejs/view/modules/View.defaults.js
* pkg: @definejs/view@1.0.0
*/
define('View.defaults', function (require, module, exports) { 
    /**
    * View 模块的默认配置。
    * @name View.defaults
    */
    module.exports = {
        /**
        * 针对移动端的。
        */
        ViewSlider: null,   
        /**
        * 所关联的 DOM 节点容器的选择器模板。
        */
        container: '[data-view="{id}"]',
        /**
        * 背景样式。
        */
        background: '',
    };
});