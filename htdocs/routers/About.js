
/**
* About 视图的顶层事件路由。
*/
define.route('About', function (require, module, nav, About) {
   
    return {
        'back': function () {
            nav.back();
        },
       
    };


});