
const Emitter = require('@definejs/emitter');


module.exports = {
    Emitter,   //事件驱动器。

    seperator: '/',     //私有模块的分隔符。
    repeated: false,    //不允许重复定义同名的模块。
    cross: false,       //不允许跨级加载模块。
};