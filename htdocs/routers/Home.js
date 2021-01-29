
/**
* Home 视图的顶层事件路由。
*/
define.route('Home', function (require, module, nav, Home) {
   
    return {
        'about': function (list) {
            nav.to('About', list);
        },
    };


});