
define.panel('/About/List', function (require, module, panel) {
    
    let meta = {
        list: [],
    };

    //初始阶段适合用来绑定事件。
    panel.on('init', function () {
        panel.template(function (item, index) {
            return {
                'index': index,
                'order': index + 1,
                'name': item.name,
                'value': item.value * 2,
            };
        });

        panel.$on('click', 'li[data-index]', function () {
            let index = +this.dataset['index'];
            let item = meta.list[index];

            panel.fire('item', [item, index]);
        });
    });

    //渲染。
    panel.on('render', function (list) {
        meta.list = list;
        panel.fill(list);
    });

    //显示时触发。
    panel.on('show', function () {

    });

    //隐藏时触发。
    panel.on('hide', function () {

    });

    //需要对外额外增加的成员。
    return {

    };

});