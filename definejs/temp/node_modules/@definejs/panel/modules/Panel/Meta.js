const IDMaker = require('@definejs/id-maker');


module.exports = {
    create(config, others) {
        let maker = new IDMaker(config.idPrefix);

        let meta = {
            'id': maker.next(),     //实例的 id，全局唯一。
            'container': '',        //容器的 DOM 节点(或其对应的选择器)。
            'rendered': false,      //是否已渲染过。
            'renderArgs': [],       //最近一次 render() 时的参数数组，用于 refresh()。
            'show': config.show,    //是否在组件 render() 后自动调用 show() 方法以进行显示。
            'visible': false,       //当前组件是否可见。

            'tplContainer': null,   //用于构造 Template 实例即 tpl 时的参数。 默认为当前 panel 实例的 container，但可以指定来改变。
            'module': null,         //如果非空，则是由 Panel.define() 创建的。 此时 container='[data-panel="xx"]' 的形式。
            '$': null,              //当前实例关联的 DOM 节点对应的 jQuery 实例。
            '$emitter': null,       //供外部用的事件管理器。
            'emitter': null,        //内部使用的事件管理器。
            'tpl': null,            //模板填充的 Template 实例。
            'panel': null,          //缓存调用 this.wrap() 后的返回结果。
            'this': null,           //方便内部使用。
        };


        Object.assign(meta, others);

        return meta;

    },
};