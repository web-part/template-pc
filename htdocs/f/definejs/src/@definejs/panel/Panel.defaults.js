/**
* src: @definejs/panel/modules/Panel.defaults.js
* pkg: @definejs/panel@1.0.0
*/
define('Panel.defaults', function (require, module, exports) { 
    
    /**
    * Panel 模块的默认配置
    * @name Panel.defaults
    */
    module.exports = {
        /**
        * 所关联的 DOM 节点容器的选择器模板。
        */
        container: '[data-panel="{id}"]',
        /**
        * 是否在组件 render 后自动调用 show() 方法以进行显示。
        */
        show: true,
    };
});