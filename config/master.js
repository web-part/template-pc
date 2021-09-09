

const defaults = require('./master/defaults');


module.exports = {
    /**
    * 通用部分。
    */
    '': defaults,

    /**
    * 针对分布式打包。
    */
    '.pack': {
        //针对分包打包的配置。
        packages: {
            enabled: true,  //是否启用 pack 分包功能。   

            //要匹配的分包文件，相对于网站根目录。。
            patterns: [
                '**/*/package.json',
                '!f/**/*/package.json', //框架目录中的要排除掉。
            ],
        },

    },
};