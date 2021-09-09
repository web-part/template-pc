/**
* src: @definejs/masker/modules/Masker.defaults.js
* pkg: @definejs/masker@1.0.1
*/
define('Masker.defaults', function (require, module, exports) { 
    
    /**
    * Masker 模块的默认配置
    * @name Masker.defaults
    */
    module.exports = {
        /**
        * 生成组件时的 id 前缀。
        * 建议保留现状。
        */
        idPrefix: 'definejs-Masker',
        /**
        * 指定是否易消失，即点击 mask 层就是否隐藏/移除。
        * 可取值为: true|false|"hide"|"remove"，默认为 false，即不易消失。
        */
        volatile: false,
        /**
        * 组件添加到的容器。
        */
        container: 'body',
        /**
        * 点击时需要用到的事件名。
        */
        eventName: 'click',
        /**
        * 需要持续显示的毫秒数。
        * 指定为 0 或不指定则表示一直显示。
        */
        duration: 0,
        /**
        * 显示时要使用淡入动画的时间。 
        * 如果不指定或指定为 0，则禁用淡入动画。
        */
        fadeIn: 0,
        /**
        * 隐藏时要使用淡出动画的时间。 
        * 如果不指定或指定为 0，则禁用淡出动画。
        */
        fadeOut: 0,
        /**
        * 组件用到的 css 类名。
        */
        cssClass: '',
        /**
        * 不透明度。
        */
        opacity: 0.5,
        /**
        * 组件的 css 样式 z-index 值。
        */
        'z-index': 1024,
        /**
        * 样式集合。
        * 外层的同名字段优先级高于里面的。
        */
        style: {},
    };
});