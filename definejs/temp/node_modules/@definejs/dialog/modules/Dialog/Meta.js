
const IDMaker = require('@definejs/id-maker');



module.exports = {
    create(config, others) {
        let maker = new IDMaker(config.idPrefix);
        let buttons = config.buttons || [];


        buttons = buttons.map(function (item) {
            return item == 'string' ? { 'text': item, } : item;
        });


        let meta = {
            'id': maker.next(),
            'headerId': maker.next('header'),
            'articleId': maker.next('article'),
            'contentId': maker.next('content'),
            'footerId': maker.next('footer'),

            'Masker': config.Masker,            //遮罩层的构造函数。 由外面按需要传入，从而避免内部关联加载。 针对移动端，如果传入了则使用。
            'Scroller': config.Scroller,        //滚动器的构造函数，由外面按需要传入，从而避免内部关联加载。 针对移动端，如果传入了则使用。
            'scrollable': config.scrollable,    //是否需要滚动内容，如果指定为 true，则必须传入 Scroller 构造器。
            'scrollerConfig': config.scroller,
            'eventName': config.eventName,
            'title': config.title,
            'content': config.content,
            'buttons': buttons,
            'z-index': config['z-index'],       //生成透明层时要用到。
            'width': config.width,              //宽度。
            'height': config.height,            //高度。
            'autoClose': config.autoClose,      //点击任何一个按钮后是否自动关闭组件
            'volatile': config.volatile,        //是否易消失。 即点击对话框外的 masker 时自动关闭对话框。
            'cssClass': config.cssClass || '',  //
            'container': config.container,      //

            'pressedClass': 'Pressed',  //底部按钮按下去时的样式类名。
            'visible': false,           //记录当前组件是否已显示
            'style': {},                //样式对象。
            'data': {},                 //供 this.data() 方法使用

            'scroller': null,           //针对移动端的滚动器。
            'masker': null,             //Masker 的实例，重复使用。
            'emitter': null,            //事件驱动器。
            'this': null,               //当前实例，方便内部使用。
            '$': null,                  //组件最外层的 DOM 节点的 jQuery 实例。
            '$header': null,            //$(headerId)。
            '$content': null,           //$(contentId)。
            '$footer': null,            //$(footerId)。
        };



        Object.assign(meta, others);


        return meta;


    },
};