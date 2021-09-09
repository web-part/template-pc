const Panel = require('@definejs/panel');

/**
* 构造器。
* @constructor
*/
function View(container, config) {
    config = Object.assign({}, exports.defaults, config);

    Panel.call(this, container, config);

    this.$.addClass('definejs-View'); //这两个类名必须加上。

    if (config.background) {
        this.$.css('background', config.background);
    }

    //针对移动端的全屏视图模式。
    //这里只负责有针对性的加上 `FullScreen` 类，而不用去掉该类。
    //因为业务层可能自行加上了该类，但 fullscreen 为 false。
    if (config.fullscreen) {
        this.$.addClass('FullScreen');
    }
}

//从 Panel 类继承。
//扩展的实例成员。
View.prototype = Object.assign(new Panel(), {
    /**
    * 仅针对移动端的代码。
    * 启用/禁用视图的滑动返回。
    */
    slider: function (enabled) {
        let ViewSlider = exports.defaults.ViewSlider;

        if (!ViewSlider) {
            return;
        }

        ViewSlider.slide(this, enabled);
    },
});


//扩展静态成员。
Object.assign(View, {
    /**
    * 默认配置。
    */
    defaults: require('./View.defaults'),
    
    /**
    * 提供一种按标准方法定义视图的方式。
    */
    define: function (id, factory) {
        Panel.define(id, factory, {
            'constructor': View,
            'defaults': exports.defaults,
        });
    },

    /**
    * 更新容器。
    * 已重载 update(id);   //更新单个。
    * 已重载 update(ids);  //更新多个。
    */
    update: function (ids) {
        Panel.update(ids, {
            'defaults': exports.defaults,
        });
    },


});

module.exports = exports = View;