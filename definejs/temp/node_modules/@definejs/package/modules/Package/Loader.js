
const API = require('@definejs/api');
const Script = require('@definejs/script');
const Tasker = require('@definejs/tasker');

var type$load = {
    /**
    * 加载 css 文件。
    *   url: '',        //要加载的文件的 url 地载。
    *   success: fn,    //加载成功后的回调函数。
    */
    css(url, success) {
        let link = document.createElement('link');

        link.onerror = function () {
            throw new Error(`css 文件加载失败: ${url}`);
        };

        link.onload = function () {
            success && success({
                'url': url,
                'content': '', //这里无法也不需要获取内容。
            });
        };

        link.rel = 'stylesheet';
        link.href = url;

        document.head.appendChild(link);
    },

    /**
    * 加载 html 文件。
    *   url: '',        //要加载的文件的 url 地载。
    *   success: fn,    //加载成功后的回调函数。
    */
    html(url, success) {
        let api = new API({
            'url': url,
            'random': false,//不需要加随机数。
            'field': null,  //显式指定为 null，以当成是普通的请求（即非 json 响应）。
        });

        api.on({
            success(xhr) { 
                let content = xhr.responseText;

                success && success({
                    'url': url,
                    'content': content,
                });
            },
            error(xhr) { 
                throw new Error('error: ' + xhr.status);
            },
        });

        api.get();
       
    },

    /**
    * 加载 js 文件。
    *   url: '',        //要加载的文件的 url 地载。
    *   success: fn,    //加载成功后的回调函数。
    */
    js(url, success) {
        Script.load(url, function () { 
            success && success({
                'url': url,
                'content': '',
            });
        });
    },

    /**
    * 加载 json 文件。
    *   url: '',        //要加载的文件的 url 地载。
    *   done: fn,       //加载成功后的回调函数。
    */
    json(url, done) {
        let api = new API({
            'url': url,
            'field': {},    //指定为一个空对象，以把响应解析成 json。
        });

        api.on({
            response(status, json, xhr) {
                all = json || {};
                done && done(all);
            },
        });

        api.get();
    },

};


module.exports = {
    /**
    * 并行加载指定的分包资源文件。
    * @param {Object} type$url 类型对应的资源 url。 如：
    *   {
    *       css: 'packages/items/Home.css',
    *       html: 'packages/items/Home.html',
    *       js: 'packages/items/Home.js',
    *   }
    */
    load(type$url, done) {
        //取出所有的类型。
        //如 ['css', 'html', 'js'];
        let types = Object.keys(type$url); 
        let tasker = new Tasker(types);

        tasker.on({
            //针对加载完成某一项。
            each(type, index, done) {
                let url = type$url[type];
                let load = type$load[type]; //找到对应的加载器方法。

                if (!load) {
                    throw new Error(`不支持加载 ${type} 类型的文件。`);
                }

                load(url, function (data) {
                    done({
                        'type': type,
                        'url': data.url,
                        'content': data.content,
                    });
                });
            },

            //全部完成。
            all(items) {
                let pack = {
                    cache: false,  //指示不是从缓存中读取的。
                };

                items.forEach(function (item) {
                    pack[item.type] = item;
                });

                done && done(pack);
            },
        });

        //并行加载。
        tasker.parallel();

    },
};