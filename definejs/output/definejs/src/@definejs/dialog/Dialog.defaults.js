/**
* src: @definejs/dialog/modules/Dialog.defaults.js
* pkg: @definejs/dialog@1.0.4
*/
define('Dialog.defaults', function (require, module, exports) { 
    const Masker = require('Masker');
    
    /**
    * Dialog 模块的默认配置
    * @name Dialog.defaults
    */
    module.exports = {
        /**
        * 生成组件时的 id 前缀。
        * 建议保留现状。
        */
        idPrefix: 'definejs-Dialog',
        /**
        * 遮罩层的构造函数。
        * 移动端需要在外部加载 Masker 模块后传入。
        */
        Masker, //这里提供一个默认的，以用于 PC 端。 至于移动端的，则需要提供 `@definejs/masker-mobile` 的。
        /**
        * 滚动器的构造函数。
        * 移动端需要在外部加载 Scroller 模块后传入。
        */
        Scroller: null, //这里由移动端提供。
        /**
        * 组件添加到的容器。
        * 默认为 document.body。
        */
        container: 'body',
        /**
        * 是否启用 mask 层。
        */
        mask: true,
        /**
        * 点击按钮后是否自动关闭组件。
        * 可取值为: true|false，默认为 true，即自动关闭。
        */
        autoClose: true,
        /**
        * 指定是否易消失，即点击 mask 层就是否隐藏/移除。
        * 可取值为: true|false，默认为不易消失。
        */
        volatile: false,
        /**
        * 组件的标题文本。
        */
        title: '',
        /**
        * 组件的内容文本。
        */
        content: '',
        /**
        * 点击按钮时需要用到的事件名。
        */
        eventName: 'click',
        /**
        * 组件用到的 css 类名。
        */
        cssClass: '',
        /**
        * 组件的 css 样式 z-index 值。
        */
        'z-index': 1024,
        /**
        * 
        */
        width: 600,
        /**
        * 组件高度。
        * 可以指定为百分比的字符串，或指定具体的数值（单位为像素），
        */
        height: '50%',
        /**
        * 样式集合。
        * 外层里面的同名字段优先级高于里面的。
        */
        style: {},
        /**
        * 按钮数组。
        */
        buttons: [],
        /**
        * 内容区是否可滚动。
        * PC 端用不可滚动。
        */
        scrollable: false,
        /**
        * 针对滚动器 Scroller 的配置。
        */
        scroller: null,
    };
});