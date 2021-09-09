
const stat = require('./stat');
const master = require('./master');
const watch = require('./watch');
const proxy = require('./server/proxy');


module.exports = {
    port: 'auto',       //必选，端口号。
    beginPort: 3001,    //当 port 为 `auto` 时，开始搜索的端口号。

    file: './output/server.json',

    //可选。
    //要映射生成的静态虚拟目录。
    //支持一对多的关系，会根据目录的添加顺序查找所需的文件。
    statics: {
        '/': '',
        // '/': './htdocs/',
        '/htdocs': './htdocs/',
        '/build': './output/build/htdocs/',

        // '/test': [
        //     './a/',
        //     './b/',
        // ],
    },


    api: {
        api: '/api',
        sse: '/api/sse',
        allowCrossOrigin: false,

        //允许访问的域名。
        //为了安全性，避免同一个局域网的其它机子访问你的项目管理平台，请指定为 `localhost`。
        //如果不指定，或者列表为空，则不限制。
        allowHosts: ['localhost', '127.0.0.1',],

        stat,
        master,

        //里面只用到 `file` 字段。
        watch: { 'file': watch.file, },

    },

    //可选。
    //生成对应的二维码页面。
    qrcode: {
        path: '/qrcode',    //二维码页面的虚拟地址。
        size: 10,           //二维码图片的大小。
        margin: 1,          //周边的空白。
    },


    //可选。
    //代理规则。
    proxy,

    done: function (app, info) {
        // console.log(info);
    },


};