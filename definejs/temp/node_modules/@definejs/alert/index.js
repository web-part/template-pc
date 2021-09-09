
//<--for.webpack.begin-->
//针对在 webpack 环境中，自动引入样式。
if ('webpackPolyfill' in module) {
    require('./modules/Alert.less');
}
//<--for.webpack.end-->

module.exports = require('./modules/Alert');
module.exports.defaults = require('./modules/Alert.defaults');                  //通用配置。
