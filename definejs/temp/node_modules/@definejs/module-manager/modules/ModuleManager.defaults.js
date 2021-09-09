/**
* ModuleManager 的默认配置。
* @name ModuleManager.defaults
*/
module.exports = {
    Emitter: null,      //事件驱动器类。
    seperator: '/',     //模块 id 内的名称分隔符，如 `Users/List/API`。
    cross: false,       //是否允许跨级加载模块。
    repeated: false,    //是否允许重复定义同一个 id 的模块。
};

