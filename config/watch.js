
module.exports = {
    //运行 `webpart watch` 命令后要输出的一些信息的路径。
    //如果不指定，则不输出。
    //在同目录的 server.js 配置中用到。
    file: './output/watch.json',

    /**
    * 通用部分。
    */
    '': {
        masters: {
            minify: false,
        },
    },

    /**
    * 针对分布式打包。
    */
    '.pack': {
        packages: {
            minify: false,
            name: '{name}',
            query: {
                md5: 4,
            },
        },
    },

};