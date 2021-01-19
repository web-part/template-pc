
module.exports = `
define.view('{id}', function (require, module, view) {
    //TODO... 引入其它模块。
    //


    //初始阶段适合用来绑定事件。
    view.on('init', function () { 

    });

    //渲染。
    view.on('render', function (data) { 

    });

    //显示时触发。
    view.on('show', function () {

    });

    //隐藏时触发。
    view.on('hide', function () { 

    });

    //需要对外额外增加的成员。
    return {

    };

});
`;