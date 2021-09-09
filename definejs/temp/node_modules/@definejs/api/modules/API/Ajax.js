
const $Object = require('@definejs/object');
const $String = require('@definejs/string');
const $JSON = require('@definejs/json');
const Proxy = require('@definejs/proxy');
const Query = require('@definejs/query');

/**
* 发起 ajax 网络请求(核心方法)。
*   method: 'get' | 'post', //网络请求的方式：'get' 或 'post'。
*   config = {
*       url: '',            //可选，请求的 url 地址。
*       prefix: '',         //可选，url 的前缀。
*       name: '',           //必选，后台接口的名称，会用在 url 中。
*       ext: '',            //可选，要用在 url 中的后缀。
*       successCode: 200,   //指示请求成功时的代码。 数字或字符串。
*       random: true,       //是否给 url 加上随机数，以刷新缓存。
*       proxy: false,       //是否启用代理。 要启用，可以指定为 true，或一个具体的 json 或 js 文件名。
*       timeout: 0,         //超时时间。 如果指定为 0，则使用浏览器内置的超时管理，会调用 error 回调函数。
*
*       //该数据会给序列化成查询字符串，然后：
*       //当 method 为 'get' 时，数据拼接在 url 中。
*       //当 method 为 'post' 时，数据放在 form-data 表单中。
*       data: {},           //可选，要发送的数据。 
*       query: {},          //可选，要发送的查询字符串数据。 该字段仅在 method 为 'post' 时可用。
*       headers: {},        //可选，要发送的请求头数据。
*
*       field: {            //可选，响应中的映射字段。 如果不指定为 null，则不当成 json 进行解析。
*           code: 'code',   //状态码。
*           msg: 'msg',     //消息。
*           data: 'data',   //主体数据。
*       },
*
*       success: fn,        //请求成功时的回调函数。
*       fail: fn,           //请求失败时的回调函数。
*       error: fn,          //请求错误时的回调函数。
*       ontimeout: fn,      //请求超时时的回调函数。
*       serialize: fn,      //对 data 字段的子对象进行序列化的方法。
*   };
*
* 返回： 
*   XMLHTTPRequest 实例对象 xhr。 
*   如果使用的是代理，则返回 null。
*/
function request(method, config) {
    let proxy = config.proxy;

    if (proxy) { //使用了代理
        Proxy.request(proxy, config);
        return null;
    }


    //完整的 url
    let url = [
        config.url,
        config.prefix,
        config.name,
        config.ext,
    ].join('');


    let data = config.data || null; // null 可能会在 xhr.send(data) 里用到。

    if (data) {
        let serialize = config.serialize; //对子对象进行序列化的方法。

        data = $Object.map(data, function (key, value) {
            if (typeof value == 'object' && value) { //子对象编码成 JSON 字符串
                return serialize(key, value);
            }

            //其他的
            return value; //原样返回
        });
    }


    if (method == 'post') {
        let query = config.query;
        if (query) {
            url = Query.add(url, query);
        }
        if (data) {
            data = Query.stringify(data);
        }
    }
    else if (data) { // 'get'
        url = Query.add(url, data);
        data = null; //要发送的数据已附加到 url 参数上
    }


    //增加一个随机字段，以使缓存失效
    let random = config.random;
    if (random) {
        random = $String.random(4);
        url = Query.add(url, random);
    }


    //同时启动超时器和发起请求，让它们去竞争。

    let isTimeout = false; //指示是否已超时
    let tid = null;
    let timeout = config.timeout || 0;

    if (timeout > 0) {
        tid = setTimeout(function () {
            isTimeout = true;
            xhr.abort(); //取消当前响应，关闭连接并且结束任何未决的网络活动。

            let fn = config.ontimeout;
            fn && fn(xhr);

        }, timeout);
    }


    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);

    xhr.onreadystatechange = function () {
        if (isTimeout || xhr.readyState != 4) {
            return;
        }


        clearTimeout(tid);

        let successCode = config.successCode;
        let fnError = config.error;
        let fnSuccess = config.success;
        let fnFail = config.fail;
        let field = config.field || null;

        if (xhr.status != 200) {
            fnError && fnError(xhr);
            return;
        }

        //没有指定 field 字段映射规则，则直接当作是请求成功了。
        if (!field) {
            fnSuccess && fnSuccess(xhr);
            return;
        }

        //以下都是指定了 field 字段映射规则的，则尝试解析成 json。
        let json = $JSON.parse(xhr.responseText);

        if (!json) {
            fnError && fnError(xhr);
            return;
        }

        let code = json[field.code];

        if (code == successCode) {
            let data = field.data in json ? json[field.data] : {};
            fnSuccess && fnSuccess(data, json, xhr);
        }
        else {
            let msg = json[field.msg];
            fnFail && fnFail(code, msg, json, xhr);
        }
    };

    //设置请求头。
    let headers = config.headers;

    if (headers) {
        $Object.each(headers, function (key, value) {
            xhr.setRequestHeader(key, value);
        });
    }


    if (method == 'post') {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }

    xhr.send(data);

    return xhr;
}


module.exports = {

    get(config) {
        return request('get', config);
    },

    post(config) {
        return request('post', config);
    },
};