//注意，此模块仅供自动化打包工具 `@definejs/packer` 使用的。
//不能单独使用，因为它依赖 `@definejs/packer` 中一个变量 `InnerMM`。
//由打包工具把其它模块和本模块打包成一个独立的库时，需要用到本模块。  
//本模块用于充当`@definejs/` 内部模块使用的默认配置管理器。   

//const InnerMM; //内部模块管理器。

const $Object = require('Object');
const id$defaults = {}; //记录模块 id 对应的默认配置。
const id$obj = {};
const hookKey = '__hooked_for_defaults__';
const suffix = '.defaults';


module.exports = exports = {
    /**
    * 设置内部模块的默认配置。
    * 会跟原有的配置作深度合并。
    * 已重载 set(id, data); //设置单个模块的配置。
    * 已重载 set(id$data);  //设置多个模块的配置，每个模块有自己的配置。
    * 已重载 set(ids, data);  //设置多个模块的配置，它们共用同一个配置。
    * @param {string} id 要设置的模块 id。
    * @param {Object} data 默认配置。
    */
    set(id, data) {
        //重载 set(ids, data); 批量设置，多个模块共用一个配置数据。
        if (Array.isArray(id)) {
            let ids = id;
            ids.forEach(function (id) {
                exports.set(id, data);
            });
            return;
        }

        //重载 set(id$data); 批量设置，每个模块有自己的配置。
        if ($Object.isPlain(id)) {
            let id$data = id;
            $Object.each(id$data, function (id, data) {
                exports.set(id, data);
            });
            return;
        }

        //重载 set(id, data); 单个设置。

        //1，已加载过了，直接合并。
        let defaults = id$defaults[id];
        if (defaults) {
            $Object.deepAssign(defaults, data);
            return;
        }

        //2，尚未加载过，先缓存起来。

        //2.1，之前已设置过一次，则与之前的合并，缓存起来。
        let obj = id$obj[id];
        if (obj) {
            $Object.deepAssign(obj, data);
            return;
        }

        //2.2，首次设置。

        //先缓存起来。
        id$obj[id] = $Object.deepAssign({}, data);

        let mm = InnerMM.create();

        if (!mm.require[hookKey]) {
            let mm_require = mm.require.bind(mm);

            //使用钩子函数进行重写，以便对 mm.require() 进行拦载，执行附加的逻辑。
            mm.require = function ($id) {
                let $exports = mm_require($id);

                //如果是 `*.defaults` 的格式，则注入附加的逻辑。
                if ($id.endsWith(suffix)) {
                    let id = $id.slice(0, -suffix.length); //去掉 `.defaults` 后缀，如 `API.defaults` 变为 `API`。
                    let obj = id$obj[id];
                    let defaults = $exports;

                    id$defaults[id] = $Object.deepAssign(defaults, obj);
                }
                
                //这个必须无条件返回出去，是原有的 require() 函数要求的。
                return $exports;
            };

            mm.require[hookKey] = true;
        }


        // //绑定加载事件，在被加载时，再进行合并。
        // mm.on('require', `${id}.defaults`, function ($module, $exports) {
        //     let defaults = $exports;
        //     let obj = id$obj[id];
        //     id$defaults[id] = $Object.deepAssign(defaults, obj);
        // });
    },

    /**
    * 获取指定模块的默认配置。
    * @param {string} id 要获取默认配置的模块 id。
    */
    get(id) {
        let defaults = id$defaults[id];

        if (!defaults) {
            defaults = id$defaults[id] = require(`${id}.defaults`);
        }

        return defaults;
    },

    /**
    * 获取或设置 definejs 内部模块的默认配置。
    * 已重载 config(id); //获取指定 id 的模块的默认配置。
    * 已重载 config(id, data); //单个设置指定 id 的模块的默认配置。
    * 已重载 config(id$data); //批量设置模块的默认配置。
    */
    config(...args) {
        //get(id)
        if (args.length == 1 && typeof args[0] == 'string') {
            return exports.get(...args);
        }

        //set()
        exports.set(...args);
    },


};