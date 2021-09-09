
/**
* Panel 模块的默认配置
* @name Panel.defaults
*/
module.exports = {
    /**
    * 生成组件时的 id 前缀。
    * 建议保留现状。
    */
    idPrefix: 'definejs-Panel',
    /**
    * 所关联的 DOM 节点容器的选择器模板。
    */
    container: '[data-panel="{id}"]',
    /**
    * 是否在组件 render 后自动调用 show() 方法以进行显示。
    */
    show: true,
};