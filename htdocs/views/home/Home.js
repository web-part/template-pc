

/**
* 主页视图。
*/
define.view('/Home', function (require, module, view) {
    
    const Menus = module.require('Menus');

    

    /**
    * 初始化时触发。
    * 即首次渲染前触发，只会触发一次。
    * 适合用来绑定事件等只需要执行一次的操作。
    */
    view.on('init', function () {
        Menus.on({
            'about': function (list) { 
                view.fire('about', [list]);
            },
        });


       
    });



    /**
    * 渲染。
    * 外面每次调 render() 时触发。
    */
    view.on('render', function (data) {

        Menus.render();

    });




    view.on('show', function () {
        
    });

    /**
    * 需要对外额外增加暴露的成员。
    */
    return {
        
    };



});