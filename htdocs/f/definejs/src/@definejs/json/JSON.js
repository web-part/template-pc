/**
* src: @definejs/json/modules/JSON.js
* pkg: @definejs/json@1.0.0
*/
define('JSON', function (require, module, exports) { 
    
    module.exports = {
        /**
        * 把一个 JSON 字符串数据解析成对象。
        * @param {String} content 要解析的内容。
        */
        parse(content) {
            try {
                let obj = JSON.parse(content);
                return obj;
            }
            catch (ex) {
                // console.warn('使用原生的 JSON.parse() 方法无法解析:', content);
                console.warn('使用原生的 JSON.parse() 方法无法解析。');
            }
    
    
            try {
                //这种方法是 jQuery 的实现，有问题。
                //content = content.replace(/^(\r\n)+/g, ' ');
                //return (new Function('return ' + content))();
    
                //下面这方法安全、可靠些。
                //包装多一层匿名立即执行函数。
                let js = [
                    'return (function () { ',
                    '   var obj = ' + content + ';', //因为 return 的换行问题，这里用一个 obj 变量再返回 obj 会安全很多。
                    '   return obj;',
                    '})();',
    
                ].join('\r\n');
    
                let fn = new Function(js);
                let obj = fn();
    
                return obj;
            }
            catch (ex) {
                console.warn('使用 new Function() 方法无法解析。');
            }
    
            return null;
    
        },
    
        /**
        * 把一个对象解析成 JSON 字符串。
        */
        stringify(...args) {
            return JSON.stringify(...args);
        },
    };
});