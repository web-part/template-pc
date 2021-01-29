
define.panel('/Home/Menus', function (require, module, panel) {
    
    let list = [
        { id: 1, name: 'Foo', value: 100, },
        { id: 2, name: 'Bar', value: 200, },
        { id: 3, name: 'Zoo', value: 300, },
    ];


    //初始阶段适合用来绑定事件。
    panel.on('init', function () { 
        panel.$on('click', '[data-cmd="{value}"]', {
            'about': function () { 

                panel.fire('about', [list]);
            },
        });
    });

    //渲染。
    panel.on('render', function (data) { 

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
