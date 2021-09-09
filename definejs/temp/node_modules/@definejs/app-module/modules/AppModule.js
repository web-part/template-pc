const ModuleManager = require('@definejs/module-manager');
const $Object = require('@definejs/object');
const $String = require('@definejs/string');

let id$factory = {};//针对模板模块。
let $mm = null;

function mm() { 
    if (!$mm) {
        $mm = new ModuleManager(exports.defaults);
    }

    return $mm;
}


module.exports = exports = {
    /**
    * 默认配置。
    */
    defaults: require('./AppModule.defaults'),

    /**
    * 使用的模块管理器(函数)。
    * 暴露出去，可以方便外界对 mm 进行各种扩展，如重写 require 方法等。
    */
    mm,
    /**
    * 定义一个指定名称的静态模块。
    * 或者定义一个动态模块，模块的 id 是一个模板字符串。
    * 该方法对外给业务层使用的。
    * @function
    * @param {string} id 模块的名称。 可以是一个模板。
    * @param {Object|function} factory 模块的导出函数或对象。
    */
    define(id, factory) {
        // id 为一个模板字符串，如 `{prefix}/Address`。
        let isTPL = id.includes('{') && id.includes('}');

        if (isTPL) {
            id$factory[id] = factory;   //定义一个模板模块，则先缓存起来。
        }
        else {
            mm().define(id, factory);
        }
    },

    /**
    * 加载指定的模块。
    * （在 App 模块中用到，用于启动程序）。
    *   
    * @function
    * @param {string} id 模块的名称。
    * @return 返回指定的模块。 
    */
    require(...args) { 
        return mm().require(...args);
    },

    /**
    * 绑定事件。
    */
    on(...args) { 
        return mm().on(...args);
    },

    /**
    * 判断指定的模块是否已定义。
    */
    has(...args) {
        return mm().has(...args);
    },

    /**
    * 设置业务层的指定模块的自定义数据。
    * 已重载 data(id, data); //设置单个模块的自定义数据。
    * 已重载 data(id$data);  //设置多个模块，每个模块有自己的自定义数据。
    * 已重载 data(id$data);  //设置多个模块，它们共用同一个自定义数据。
    */
    data(id, data) { 
        //重载 data(ids, data);
        //多个模块共用一个自定义数据。
        if (Array.isArray(id)) {
            let ids = id;
            ids.forEach((id) => {
                mm().data(id, data);
            });
            return data;
        }

        //重载 data(id$data);   
        //每个模块有自己的自定义数据。
        if ($Object.isPlain(id)) {
            let id$data = id;
            $Object.each(id$data, function (id, data) { 
                mm().data(id, data);
            });
            return id$data;
        }

        //重载 data(id, data);
        //设置单个模块的自定义数据。
        return mm().data(id, data);
    },

    /**
    * 使用模板模块动态定义一个模块。
    * 即填充一个模板模块，以生成（定义）一个真正的模块。
    *   sid: '',    //模板模块的 id，如 `{prefix}/Address`
    *   data: {},   //要填充的数据，如 { prefix: 'Demo/User', }
    */
    fill(sid, data) {
        //需要扫描所有模板，同时填充它的子模块。
        $Object.each(id$factory, function (id, factory) {

            //所有以 sid 为开头的模板模块都要填充，
            //如 sid 为 `{prefix}/Address`，id 为 `{prefix}/Address/API`
            if (!id.startsWith(sid)) {
                return;
            }

            //填充成完整的模块 id。
            id = $String.format(id, data);

            console.log(`动态定义模块: ${id}`);

            mm().define(id, factory);

        });

    },
};

//增加一个快捷方法，以便可以判断某个模块是否已定义。
exports.define.has = exports.has;