
//<--for.webpack.begin-->
//针对在 webpack 环境中，自动引入样式。
if ('webpackPolyfill' in module) {
    require('./modules/Dialog.less');
}
//<--for.webpack.end-->

module.exports = require('./modules/Dialog');
module.exports.defaults = require('./modules/Dialog.defaults');               //通用配置。

