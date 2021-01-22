
/**
* About 视图的顶层事件路由。
*/
define.route('About', function (require, module, exports, About) {
   
    return {
        'back': function () {
            nav.back();
        },

       
    };


});