/**
* src: @definejs/fn/modules/Fn.js
* pkg: @definejs/fn@1.0.0
*/
define('Fn', function (require, module, exports) { 
    const $Math = require('Math');
    
    
    /**
    * 函数工具。
    */
    module.exports = {
        /**
        * 空函数。
        * 提供一个什么也不做、直接原样返回入参的空操作函数。
        * 在很多场合可以用来提供给模块配置，以要求的回调函数不为空。
        */
        noop(...args) {
            return args[0];
        },
    
        /**
        * 用一个的随机延迟时间去执行一个回调函数，并传递一些参数。
        * @param {Object} delay 延迟配置对象。
            如 { min: 500, max: 2000, }，当不需要延迟时，则应为 null。
        * @param {function} fn 要延迟执行的函数。
        * @param {Array} [args] 要传递的参数数组。
        * @return {number} 返回 setTimeout 的结果。
        *   如果没有启用延迟，则不返回值。
        */
        delay(delay, fn, args) {
            if (!fn) {
                return;
            }
    
            if (delay === false || delay == null) { //不启用延迟
                fn.apply(null, args);
                return;
            }
    
            let timeout =
                typeof delay == 'number' ? delay :
                $Math.randomInt(delay.min, delay.max);
    
            return setTimeout(function () {
                fn.apply(null, args);
    
            }, timeout);
        },
    
        /**
         * 构造一个函数闭包来执行指定的代码字符串。
         * @param {string} content 要执行的代码字符串。
         * @returns {*} 返回代码字符串里所返回的值。
         */
        exec(content) {
            let js = `
                return (function () { 
                    ${content}
                })();
            `;
    
            let fn = new Function(js);
    
            return fn();
        },
    };
});