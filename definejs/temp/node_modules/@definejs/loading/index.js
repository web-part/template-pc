
//<--for.webpack.begin-->
//针对在 webpack 环境中，自动引入样式。
if ('webpackPolyfill' in module) {
    require('./modules/Loading.less');
}
//<--for.webpack.end-->

module.exports = require('./modules/Loading');
module.exports.defaults = require('./modules/Loading.defaults');

