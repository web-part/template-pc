/**
* src: @definejs/id-maker/modules/IDMaker.defaults.js
* pkg: @definejs/id-maker@1.0.1
*/
define('IDMaker.defaults', function (require, module, exports) { 
    
    
    /**
    * IDMaker 模块的默认配置
    * @name IDMaker.defaults
    */
    module.exports = {
        /**
        * 生成随机串部分的长度。
        */
        random: 4,
    
        /**
        * 生成 id 的模板。
        */
        sample: {
            /**
            * 没有指定分组时的生成 id 的模板。
            */
            '': '{name}-{index}-{random}',
    
            /**
            * 有指定分组时的生成 id 的模板。
            */
            'group': '{name}-{group}-{index}-{random}'
        },
    };
});