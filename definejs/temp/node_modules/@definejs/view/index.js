
//<--for.webpack.begin-->
//针对在 webpack 环境中，自动引入样式。
if ('webpackPolyfill' in module) {
    require('./modules/View.less');
}
//<--for.webpack.end-->

module.exports = require('./modules/View');
module.exports.defaults = require('./modules/View.defaults');               //通用配置。

