
//<--for.webpack.begin-->
//针对在 webpack 环境中，自动引入样式。
if ('webpackPolyfill' in module) {
    require('./modules/Toast.less');
    require('font-awesome/css/font-awesome.css');
}
//<--for.webpack.end-->


module.exports = require('./modules/Toast');
module.exports.defaults = require('./modules/Toast.defaults');