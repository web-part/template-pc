
//<--for.webpack.begin-->
//针对在 webpack 环境中，自动引入样式。
if ('webpackPolyfill' in module) {
    require('./modules/Confirm.less');
}
//<--for.webpack.end-->

module.exports = require('./modules/Confirm');
module.exports.defaults = require('./modules/Confirm.defaults');               //通用配置。

