/**
* src: @definejs/alert/modules/Alert.js
* pkg: @definejs/alert@1.0.2
*/
define('Alert', function (require, module, exports) { 
    /**
    * alert 对话框。
    */
    const $String = require('String');
    const Dialog = module.require('Dialog');
    const Sample = module.require('Sample');
    
    
    module.exports = exports = {
        /**
        * 默认配置。
        */
        defaults: require('Alert.defaults'),
        
        /**
        * 显示一个 alert 对话框。 
        * 支持多次调用，会将多次调用加进队列，在显示完上一次后进行下一次的显示。
        */
        show(text, text1, textN, fn) {
            //重载 show(obj); 
            //以方便程序员调试查看 json 对象。
            if (typeof text == 'object') {
                text = JSON.stringify(text, null, 4);
                text = $String.format(Sample, { 'text': text, });
            }
    
            let args = [...arguments];
    
            //在参数列表中找到的第一个函数当作是回调函数，并忽略后面的参数。
            let index = args.findIndex(function (item, index) {
                return typeof item == 'function';
            });
    
            if (index > 0) { //找到回调函数
                fn = args[index];
                args = args.slice(0, index); //回调函数前面的都当作是要显示的文本
            }
            else {
                fn = null;
            }
    
            text = $String.format(...args);
            
            Dialog.init(exports.defaults);
            Dialog.add(text, fn);
        },
    };
    
    
});