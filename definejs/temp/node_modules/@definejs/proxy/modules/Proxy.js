const $Url = require('@definejs/url');
const $JSON = require('@definejs/json');
const Fn = require('@definejs/fn');
const Script = require('@definejs/script');
const Url = require('./Proxy/Url');


let current = null; //当前请求到的代理文件的响应结果 factory。


//模拟一个网络的随机延迟时间去执行一个回调函数
function delay(fn, ...args) {
    let delay = exports.defaults.delay;
    Fn.delay(delay, fn, args);
}


//加载完成后，根据状态分发事件。
function done(json, config) {
    if (!json) {
        delay(config.error);
        return;
    }

    let successCode = config.successCode;
    let field = config.field;
    let code = json[field.code];

    if (code == successCode) { // 成功
        let data = json[field.data] || {};
        delay(config.success, data, json);
    }
    else { //失败
        let msg = json[field.msg] || '';
        delay(config.fail, code, msg, json);
    }
}

/**
* 加载指定的 js 代理文件。
* 注意：加载完 js 代理文件后，会先执行 js 代理文件的逻辑，再触发 onload 事件。
* 经过试验发现，并发加载多个 js 文件，也会严格地按上述顺序对应的进行。
*/
function loadJS(file, config) {
    let base = exports.defaults.base;
    let url = Url.get(file, base);

    Script.load(url, function () {
        let factory = current;
        current = null;

        if (typeof factory == 'function') {
            factory = factory(config.data, config);
        }

        done(factory, config);

    });
}

/**
* 加载指定的 json 代理文件。
*/
function loadJSON(file, config) {
    let base = exports.defaults.base;
    let url = Url.get(file, base);
    let xhr = new XMLHttpRequest();

    xhr.open('get', url, true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) {
            return;
        }

        if (xhr.status != 200) {
            delay(config.error);
            return;
        }

        let json = $JSON.parse(xhr.responseText);

        done(json, config);
    };

    xhr.send(null);
}


module.exports = exports = {
    /**
    * 默认配置。 
    */
    defaults: require('./Proxy.defaults'),
    
    /**
    * 发起代理请求。
    * @param {String} file 代理响应的文件地址。
    * @param {Object} config 配置对象。
    */
    request(file, config) {
        if ($Url.isExt(file, '.js')) { // 映射的响应是一个 js 文件
            loadJS(file, config);
            return;
        }

        if ($Url.isExt(file, '.json')) {
            loadJSON(file, config);
            return;
        }

        throw new Error('不支持参数 file 的文件类型: ' + file);
    },

    /**
    * 响应代理请求。
    * 可以生成很复杂的动态数据，并根据提交的参数进行处理，具有真正模拟后台逻辑的能力。
    * 该方法仅用在代理响应文件中，且在调用之前必须先调用 request 方法。
    * 已重载 response(json)的情况。
    * @param {function|Object} factory 响应的处理函数或 json 对象。
    *   当传进来的 factory 为处理函数时，该函数会接收到两个参数：factory(data, config)。 其中：
    *   data 为发起 get 或 post 请求时最终的 data 字段；
    *   config 为发起 get 或 post 请求时全部的配置字段。
    */
    response(factory) {
        //var type = typeof factory;
        //var isValid = type == 'function' || type == 'object' && factory;

        //if (!isValid) {
        //    throw new Error('参数 factory 只能是函数或非空对象');
        //}

        current = factory;
    },

};