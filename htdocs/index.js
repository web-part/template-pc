
/*
* 主控制器。
*/
definejs.launch(function (require, module, nav) {
   

    nav.on({
        'none': function () {
            nav.to('Home');
        },

        'start': function (hash, old) {
            //不需要登录就能直接打开的视图。
            var views = [
                'Home',
            ];

            if (views.includes(hash)) {
                nav.to(hash);
            }
            else {
                nav.to('Home');
            }
        },
    });

    nav.render();


  
});



