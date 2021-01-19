
module.exports = `
define.panel('{id}', function (require, module, panel) {
    //TODO... 引入其它模块。
    //

    //初始阶段适合用来绑定事件。
    panel.on('init', function () { 

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
`;