

; (function (definejs) {

    var AppModule = definejs.require('AppModule');
    var define = window.define = AppModule.define;

    Object.assign(define, {
        'panel': definejs.panel,
        'view': definejs.view,
        'module': definejs.define,
        'data': definejs.data,
        'route': definejs.route,
        'proxy': definejs.proxy,
    });




    //业务端模块的默认配置。
    define.data({
        '/About': {
            copyright: '2020 webpart',
        },
    });






    // KISP 内部模块所需要的默认配置
    definejs.config({
        'API': {
            // proxy: true,


            /**
            * API 接口 Url 的主体部分。
            * 模块 Env 会配置进去。
            */
            url: '',


            /**
            * API 接口 Url 的后缀部分。
            * 针对那些如 '.do'、'.aspx' 等有后缀名的接口比较实用。
            */
            ext: '',

            /**
            * 在 url 中增加一个随机 key，以解决缓存问题。
            * 当指定为 false 时，则禁用。
            */
            random: false,

            //为了防止后台过快的返回数据而显示让某些需要显示
            //"数据加载中"的效果不明显， 这里强行加上一个随机延迟时间。
            delay: {
                min: 400,
                max: 800,
            },

        },

        'View': {
            //background: '#EFEFF4',
            background: '#fff',
        },

        'Proxy': {
            base: 'api/',
        },

        'App': {
            name: 'webpart-demo-normal-20210119',
        },


        'Masker': {
            fadeIn: 200,
            fadeOut: 200,
        },

    });







})(window.definejs);


