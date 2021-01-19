
/**
* definejs library
* build time: 2021-01-19 09:18:27
* build tool: @definejs/packer
* source packages (38):
* {
*     "@definejs/alert@1.0.0": "Alert",
*     "@definejs/api@1.0.0": "API",
*     "@definejs/app-module@1.0.0": "AppModule",
*     "@definejs/app@1.0.0": "App",
*     "@definejs/array@1.0.0": "Array",
*     "@definejs/confirm@1.0.0": "Confirm",
*     "@definejs/date@1.0.0": "Date",
*     "@definejs/defaults@1.0.0": "Defaults",
*     "@definejs/dialog@1.0.0": "Dialog",
*     "@definejs/emitter@1.0.0": "Emitter",
*     "@definejs/escape@1.0.0": "Escape",
*     "@definejs/fn@1.0.0": "Fn",
*     "@definejs/hash@1.0.0": "Hash",
*     "@definejs/html-parser@1.0.0": "HTMLParser",
*     "@definejs/json@1.0.0": "JSON",
*     "@definejs/loading@1.0.0": "Loading",
*     "@definejs/local-storage@1.0.0": "LocalStorage",
*     "@definejs/masker@1.0.0": "Masker",
*     "@definejs/math@1.0.0": "Math",
*     "@definejs/module-manager@1.0.0": "ModuleManager",
*     "@definejs/navigator@1.0.0": "Navigator",
*     "@definejs/object@1.1.0": "Object",
*     "@definejs/package@1.0.0": "Package",
*     "@definejs/panel@1.0.0": "Panel",
*     "@definejs/proxy@1.0.0": "Proxy",
*     "@definejs/query@1.0.0": "Query",
*     "@definejs/script@1.0.0": "Script",
*     "@definejs/session-storage@1.0.0": "SessionStorage",
*     "@definejs/string@1.0.0": "String",
*     "@definejs/style@1.0.0": "Style",
*     "@definejs/tabs@1.0.0": "Tabs",
*     "@definejs/tasker@1.0.0": "Tasker",
*     "@definejs/template@1.0.0": "Template",
*     "@definejs/timer@1.0.0": "Timer",
*     "@definejs/toast@1.0.0": "Toast",
*     "@definejs/tree@1.0.0": "Tree",
*     "@definejs/url@1.0.0": "Url",
*     "@definejs/view@1.0.0": "View"
* }
*/
; (function (
    global,

    top,
    parent,
    window,
    document,
    location,
    navigator,
    localStorage,
    sessionStorage,
    console,
    history,
    setTimeout,
    setInterval,

    Array,
    Boolean,
    Date,
    Error,
    Function,
    JSON,
    Map,
    Math,
    Number,
    Object,
    RegExp,
    String,

    undefined
) {




//模块管理器用于定义 `module-manager` 包中的模块，提供最简单的模块定义和加载功能。
const BaseMM = (function () {
    const id$factory = {};
    const id$exports = {};

    function define(id, factory) {
        id$factory[id] = factory;
    }

    function require(id) { 
        let exports = id$exports[id];
        if (exports) {
            return exports;
        }

        let factory = id$factory[id];

        let module = {
            exports: {},
            //用于加载当前模块的直接子模块。
            require(name) {
                return require(`${id}/${name}`);
            },
        };


        exports = factory(require, module, module.exports);

        //没有通过 return 来返回值，则要导出的值只能在 module.exports 里。
        if (exports === undefined) {
            exports = module.exports;
        }

        id$exports[id] = exports;

        return exports;
    }

    return {
        define,
        require,
        //供 `patial.end.js` 使用，以便重新定义一份。
        each(fn) { 
            Object.keys(id$factory).forEach(fn);
        },
    };

})();

//马上暴露给内部使用。
const $define = BaseMM.define;
//此模块管理器用于 `@definejs/` 域内的所有模块的包装定义。
//立即执行函数里的参数 require 用于加载 `module-manager` 包中
//对应的主模块 ModuleManager，然后用它去创建和管理模块。
const InnerMM = (function ({ require, }) {
    let mm = null;

    function create() {
        if (mm) {
            return mm;
        }

        const ModuleManager = require('ModuleManager');

        //内部使用的模块管理器。
        mm = new ModuleManager({
            cross: true,       //内部的，要允许跨级加载模块。 用于在一步到位加载某个模块的默念配置，如 `SSH/Server.defaults`
        });

        return mm;
    }


    return {
        //在 Defaults.js 中用到。
        create,

        has: function (...args) {
            let mm = create();
            return mm.has(...args);
        },

        define: function (...args) {
            let mm = create();
            return mm.define(...args);
        },

        //在 `partial/end.js` 中用到。
        require: function (...args) {
            let mm = create();
            return mm.require(...args);
        },

        /**
        * 绑定到指定模块的指定方法。
        * @param {string} id 模块的 id。
        * @param {string} name 要绑定的模块方法的名称。
        * @param {Object|boolean} context 绑定的方法执行时的上下文，即 this 变量的指向。
        *   如果传入 true，则表示当前要绑定的模块本身。
        * @return {function} 返回绑定后的方法。
        */
        bind: function (id, name, context) {
            return function (...args) {
                let mm = create();
                var M = mm.require(id);
                var fn = M[name];

                if (typeof fn != 'function') {
                    throw new Error(`要绑定的模块 ${id} 中不存在名为 ${name} 的方法或函数。`);
                }

                context = context === true ? M : context || null;

                return fn.call(context, ...args);
            };
        },

    };

})(BaseMM);

//马上暴露给内部使用。
const define = InnerMM.define;



/**
* file: @definejs/module-manager/modules/ModuleManager/Module.js
* package: @definejs/module-manager@1.0.0
*/
$define('ModuleManager/Module', function (require, module, exports) { 
    
    const mapper = new Map();
    
    class Module {
        /**
        * 构造器。
        *   id: '',     //模块 id，`Users/List/API`。
        *   config = {
        *       seperator: '',  //分隔符，如 `/`。
        *       mm: null,       //模块管理器 ModuleManager 的实例。
        *       emitter: null,  //事件驱动器实例。
        *
        *       //会扩展到 this 的成员。
        *       exports: {},    //导出对象。
        *       parent: null,   //父模块。 也是 Module 实例。
        *   };
        *
        */
        constructor(id, config) {
            let seperator = config.seperator;
            let names = id.split(seperator);    //全部名称的数组。
            let name = names.slice(-1)[0];      //短名称，如 `API`。
            let parent = config.parent;
    
            if (parent) {
                //在一个模块的工厂函数里：
                //防止通过 module.parent.require(...) 来加载它的兄弟模块。
                //仅允许通过 module.require(...) 来加载自己的直接子模块。
                //如当前模块为 `Users/List/API`，它的父模块则为 `Users/List`，
                //假如它还有个兄弟(同级)模块 `Users/List/Loading`，
                //则不允许 `API` 模块通过它的父模块来加载同级模块 `Loading`。
                //parent.require = function (name) {
                //    throw new Error(`禁止通过父模块来加载同级模块：模块 ${id} 尝试加载同级模块 ${name}。`);
                //};
    
                parent = Object.create(parent, {
                    require: {
                        value: function (name) {
                            throw new Error(`禁止通过父模块来加载同级模块：模块 ${id} 尝试加载同级模块 ${name}。`);
                        },
                    },
                });
            }
    
    
            //内部方法使用的字段。
            //安全起见，不使用暴露给外面的的那份，防止调用方恶意去改。
            let meta = {
                'id': id,                   //模块 id，`Users/List/API`。
                'seperator': seperator,     //上下级模块名称的分隔符，如 `/`。
                'emitter': config.emitter,  //事件驱动器。 可以为空。
                'mm': config.mm,            //所属的模块管理器。
                'this': this,               //方便访问自己。
            };
    
            mapper.set(this, meta);
    
    
            //暴露给外部使用的属性。
            Object.assign(this, {
                'id': id,
                'name': name,
                'names': names,
                'seperator': seperator,
    
                //扩展到 this 的成员。
                'data': config.data,        //关联的自定义数据。
                'exports': config.exports,  //模块的导出对象。
                'parent': parent,           //父模块。
            });
        }
    
        // id = '';            //模块的 id，如 `Users/List/API`。
        // name = '';          //模块的(短)名称，如 `API`。
        // seperator = '';     //模块 id 中的分隔符，如 `/`。 
        // exports = null;     //模块的导出对象。
        // parent = null;      //父模块。
        // data = null;        //关联的自定义数据。
    
        
    
        /**
        * 在当前模块上绑定事件。
        */
        on(...args) {
            let meta = mapper.get(this);
            let emitter = meta.emitter;
    
            emitter && emitter.on(...args);
        }
    
        /**
        * 加载直接子模块。
        * 即工厂函数 factory(require, module, exports) {} 中的第二个参数要用到的方法如：
        *   var Helper = module.require('Helper');
        * @param {string} name 直接下级模块的短名称。
        *   注意：短名称中不允许包含分隔符，如 `/`。
        */
        require(name) {
            let meta = mapper.get(this);
            let seperator = meta.seperator;
            let id = meta.id + seperator + name;    //完整名称，如 `Users/List/API/Helper`。
    
            if (name.includes(seperator)) {
                throw new Error(`模块 ${meta.id} 不允许跨级加载模块: ${id}`);
            }
    
    
            //允许模块管理器跨级加载模块。
            let exports = meta.mm.require(id, true);
    
            return exports;
        }
    
        /**
        * 在首次 require 子模块时，绑定该子模块上的事件。
        * 已重载 bind(name$events);    //批量绑定多个子模块对应的多个事件。
        * 已重载 bind(name, events);   //单个绑定指定子模块对应的多个事件。
        * @param {string} name (直接)子模块的短名称。
        * @param {object} events 由事件名称作为键，处理函数作为值组成的键值对对象。
        */
        bind(name, events) {
            //把单个绑定和批量绑定统一形式。
            let name$events = typeof name == 'object' ? name : { [name]: events, };
            let meta = mapper.get(this);
    
            Object.keys(name$events).forEach(function (name) {
                let events = name$events[name];
    
                let fn = (typeof events == 'function') ? events : function (M) {
                    M.on(events);
                };
    
                //当前模块加载子模块时触发。
                //如当前模块为 `Users/List/API`，子模块为 `Helper`，
                //在加载该子模块时，绑定 `Helper` 的抛出来的事件。
                meta.this.on('require', name, fn);
            });
    
        }
    
    
    
        /**
        * 加载指定的子模块并调用 render() 方法，可向其传递一些参数。
        * @param {string} name 要加载的子模块名称。
        * @return {Object} 返回加载到的子模块实例。
        */
        render(name, ...args) {
            let M = this.require(name);
    
            if (!M) {
                throw new Error(`模块 ${meta.id} 不存在名为 ${name} 的直接子模块`);
            }
    
            M.render(...args);
            return M;
        }
    
    
    }
    
    module.exports = Module;
});

/**
* file: @definejs/module-manager/modules/ModuleManager.defaults.js
* package: @definejs/module-manager@1.0.0
*/
$define('ModuleManager.defaults', function (require, module, exports) { 
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
    
    
});

/**
* file: @definejs/module-manager/modules/ModuleManager.js
* package: @definejs/module-manager@1.0.0
*/
$define('ModuleManager', function (require, module, exports) { 
    
    const Module = module.require('Module');
    
    const mapper = new Map();
    
    
    
    
    class ModuleManager {
        /**
        * 构造器。
        *   options = {
        *       seperator: '/',     //模块 id 内的名称分隔符，如 `Users/List/API` 中的 `/`。
        *       cross: false,       //是否允许跨级加载模块。
        *       repeated: false,    //是否允许重复定义同一个 id 的模块。
        *       Emitter: null,      //事件驱动器类。
        *   };
        */
        constructor(options) {
            let config = Object.assign({}, exports.defaults, options);
            let Emitter = config.Emitter;
            let emitter = Emitter ? new Emitter(this) : null;
    
            let meta = {
                'id$module': {},
                'id$data': {},                  //模块关联的自定义数据，仅供模块的工厂函数中内部使用。
                'seperator': config.seperator,  //父子模块命名中的分隔符，如 `User/List/API`。
                'cross': config.cross,          //是否允许跨级加载模块。
                'repeated': config.repeated,    //是否允许重复定义模块。
                'emitter': emitter,             //当前 `模块管理器` 的全局事件管理器。
                'Emitter': Emitter,             //事件管理器构造器。 用于 define() 中，以便针对每个模块创建它私有的 emitter。
                'this': this,                   //方便内部访问 this 对象。
    
                /**
                * 用于给工厂函数加载公共模块。
                * 同时限制为仅允许加载公共模块。
                * 即 factory(require, module, exports){ } 中的第一个参数 `require`。
                */
                require(id) {
                    return meta.this.require(id);
                },
    
                /**
                * 内部使用的，触发全局事件。
                */
                fire(...args) {
                    emitter && emitter.fire(...args);
                },
    
                /**
                * 内部使用的，获取指定 id 对应的父模块对象。
                * 如 `User/List/API` 的父模块 id 为 ``User/List`。
                */
                getParent(id) {
                    let seperator = meta.seperator;
                    let names = id.split(seperator);
    
                    //顶级模块。
                    if (names.length == 1) {
                        return null;
                    }
    
                    //如 `Users/List`
                    let pid = names.slice(0, -1).join(seperator);
    
                    return meta.id$module[pid] || null;
                },
    
            };
    
            mapper.set(this, meta);
    
            //全局地监听每个模块的首次加载事件。
            this.on('require', function (id, module, exports) {
                //触发被加载模块的首次加载事件。
                module.fire('require', [exports]);
    
                //触发本级模块的事件。
                //取它的父模块的事件管理器。
                let parent = module.parent;
    
                if (parent) {
                    parent.fire('require', module.name, [exports]);
                }
    
            });
    
        }
    
    
        /**
        * 设置指定模块关联的自定义数据。
        * 模块关联的自定义数据仅供模块的工厂函数中内部使用。
        * 即在 define(id, function(require, module, exports) {
        *   var data = module.data;
        * });
        * @param {string} id 模块 id。
        * @param {*} data 模块对应的自定义数据。
        * @returns {*} 返回入参 data。
        */
        data(id, data) {
            if (typeof id != 'string') {
                throw new Error(`参数 id 为要设置的模块的 id，必须为 string 类型。`);
            }
    
            let meta = mapper.get(this);
            meta.id$data[id] = data;
            return data;
        }
    
        /**
        * 定义一个模块。
        * @param {string} id 模块的名称。
        * @param {function|Object|Array} factory 模块的工厂函数或导出对象。
        *   工厂函数原型为 factory(require, module, exports) { }
        */
        define(id, factory) {
            if (typeof id != 'string') {
                throw new Error(`参数 id 的类型必须为 string，当前为: ${typeof id}`);
            }
    
            let meta = mapper.get(this);
            let id$module = meta.id$module;
    
            if (!meta.repeated && id$module[id]) {
                throw new Error(`配置设定了不允许定义重复的模块: 已存在名为 ${id} 的模块`);
            }
    
            let Emitter = meta.Emitter;
            let emitter = Emitter ? new Emitter() : null;
            let name = id.split(meta.seperator).slice(-1)[0];      //取最项一项作为短名称，如 `API`。
    
            id$module[id] = {
                'id': id,           //全名称，如 `Users/List/API`。
                'name': name,       //短名称，如 `API`。 如果 name == id，则说明是顶级模块，即不含有 `/`。
                'factory': factory, //原始的工厂函数或导出对象。
                'emitter': emitter, //用于工厂函数第二个参数 `module` 的事件驱动器。
    
                //以下的在 require() 后肯定会给改写。
                'parent': null,     //父级对象。 如果为空，则说明是顶级模块。
                'required': false,  //指示是否已经 require 过。
                'count': 0,         //require 的次数统计。
    
                //以下的在 require() 后可能会给改写。
                'exports': null,    //最终的导出对象。 要么是 factory 本身，要么是 factory 运行后的结果。
                'mod': null,        //工厂函数第二个参数 `module`。 如果工厂函数是一个直接导出对象，则它为空。
    
                //触发当前模块级别的事件。
                fire() {
                    emitter && emitter.fire(...arguments);
                },
    
            };
        }
    
        /**
        * 加载指定的模块。
        * @param {string} id 模块的名称。
        * @param {boolean} cross 是否允许跨级加载模块。
        *   如果不指定，则根据创建实例时指定的 cross 来决定。
        * @return 返回指定的模块的导出对象。
        */
        require(id, cross) {
            if (typeof id != 'string') {
                throw new Error(`参数 id 的类型必须为 string，当前为: ${typeof id}`);
            }
    
            let meta = mapper.get(this);
            let seperator = meta.seperator;
    
    
            //未指定，则使用创建实例时的配置。
            if (cross === undefined) {
                cross = meta.cross;
            }
    
    
            if (!cross && id.includes(seperator)) {
                throw new Error(`参数指定了或配置设定了不允许跨级加载模块: ${id}`);
            }
    
            //不存在该模块。
            if (!this.has(id)) {
                return;
            }
    
            let id$module = meta.id$module;
            let module = id$module[id];
    
            //加载次数累计。
            module.count++;
    
    
            //已经加载过了。
            if (module.required) {
                return module.exports;
            }
    
            //==============================================================================
            //首次加载。
            module.required = true; //更改标志，指示已经 require 过一次。
    
            let factory = module.factory;
            let parent = module.parent = meta.getParent(id);
    
            //非工厂函数，则直接导出。
            if (typeof factory != 'function') {
                module.exports = factory;
                meta.fire('require', id, [module, factory]);
                meta.fire('require', [id, module, factory]);
                return factory;
            }
    
            //--------------------------------------------------------------------------------
            //factory 是个工厂函数。
    
            //同时也要赋值给 module.exports，针对两个模块间的循环 require 时用到。
            //因为此时在 factory 中会提前用到 exports。
            let exports = module.exports = {};
    
            //mod 就是工厂函数 factory(require, module, exports) 中的第二个参数啦。
            let mod = module.mod = new Module(id, {
                'seperator': seperator,
                'mm': this,
                'emitter': module.emitter,
    
                //会扩展到 mod 的属性。
                'data': meta.id$data[id],
                'exports': exports,                     //模块的导出对象。
                'parent': parent ? parent.mod : null,   //父模块实例。
            });
    
            //调用工厂函数获得导出对象。
            exports = factory(meta.require, mod, exports);
    
            //没有通过 return 来返回值，则要导出的值只能在 mod.exports 里。
            if (exports === undefined) {
                exports = mod.exports;
            }
    
            //这条是必须的。 因为 factory() 可能返回了一个新的导出对象。
            module.exports = exports;
    
            //这条，给提供业务层提供方便。
            //即使业务层是通过 return 来返回导出对象，
            //导出对象各成员函数之间依然可以通过 `module.exports.xx` 来引用其它的成员。
            mod.exports = exports;
    
            meta.fire('require', id, [module, exports]);
            meta.fire('require', [id, module, exports]);
    
            return exports;
        }
    
        /**
        * 绑定事件。
        */
        on(...args) {
            let meta = mapper.get(this);
            let emitter = meta.emitter;
    
            emitter && emitter.on(...args);
        }
    
        /**
        * 判断指定的模块是否已定义。
        */
        has(id) {
            let meta = mapper.get(this);
            let id$module = meta.id$module;
    
            return id$module.hasOwnProperty(id);
        }
    
        /**
        * 销毁本实例。
        */
        destroy() {
            let meta = mapper.get(this);
            let emitter = meta.emitter;
    
            emitter && emitter.destroy();
            mapper.delete(this);
        }
    
    
    }
    
    ModuleManager.defaults = require('ModuleManager.defaults');
    module.exports = exports = ModuleManager;
});

/**
* src: @definejs/defaults/modules/Defaults.js
* pkg: @definejs/defaults@1.0.0
*/
define('Defaults', function (require, module, exports) { 
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
});
/**
* src: @definejs/object/modules/Object.js
* pkg: @definejs/object@1.1.0
*/
define('Object', function (require, module, exports) { 
    
    function copy(A, B) {
        A = A || {};
    
        for (let key in B) {
            let source = A[key];
            let target = B[key];
    
            if (exports.isPlain(target)) {
                source = exports.isPlain(source) ? copy({}, source) : {};
                target = copy(source, target);
            }
    
            A[key] = target;
        }
    
        return A;
    }
    
    
    /**
    * Object 对象工具。
    */
    module.exports = exports = {
        /**
        * 深度扩展（拷贝）多个对象到目标对象上。
        * @param {Object} target 目标对象。
        * @param {Array} ...args 需要拷贝的对象列表。
        */
        deepAssign(target, ...args) {
            args.forEach((item) => {
                target = copy(target, item);
            });
    
            return target;
        },
        /**
        * 检测对象是否是空对象(不包含任何属性)。
        * 该方法既检测对象本身的属性，也检测从原型继承的属性(因此没有使用 hasOwnProperty )。
        * 该实现为 jQuery 的版本。
        * @param {Object} obj 要进行检测的对象，可以是任何类型。
        * @return {boolean} 一个检测结果，如果为空对象则返回 true；否则返回 false。
        * @example
        *   $Object.isEmpty({});      //true
        * @example
        *   function Person(){ }
        *   Person.prototype.name = 'abc';
        *   var p = new Person();
        *   $Object.isEmpty( p );   //false
        */
        isEmpty(obj) {
            for (let name in obj) {
                return false;
            }
    
            return true;
        },
        /**
        * 检测一个对象是否是纯粹的对象（通过 "{}" 或者 "new Object" 创建的）。
        * 该实现为 jQuery 的版本。
        * @param {Object} obj 要进行检测的对象，可以是任何类型。
        * @return {boolean} 一个检测结果，如果为纯粹的对象则返回 true；否则返回 false。
        * @example
        *   $Object.isPlain( {} );             //true
        *   $Object.isPlain( {a: 1, b: {} } );  //true
        * @example      
        *   function Person(){ }
        *   var p = new Person();
        *   $Object.isPlain( p );   //false
        */
        isPlain(obj) {
            if (!obj || typeof obj != 'object' /*|| obj.nodeType || exports.isWindow(obj) */) {
                return false;
            }
    
            var hasOwnProperty = Object.prototype.hasOwnProperty;
            var constructor = obj.constructor;
    
            try {
                // Not own constructor property must be Object
                if (constructor &&
                    !hasOwnProperty.call(obj, "constructor") &&
                    !hasOwnProperty.call(constructor.prototype, "isPrototypeOf")) {
                    return false;
                }
            }
            catch (e) {
                // IE8,9 Will throw exceptions on certain host objects #9897
                return false;
            }
    
            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.
            var key;
            for (key in obj) {
            }
    
            return key === undefined || hasOwnProperty.call(obj, key);
        },
        /**
        * 把一个对象的键/值对深层次地扁平化成一个数组。
        * @param {Object} obj 要进行线性化的纯对象。
        * @return {Array} 返回一个线性化表示的一维数组。
        *   数组的每项都为一个 { keys: [], value: ... } 的结构。
        * @example
            var list = $Object.flat({
                name: {
                    a: 1,
                    b: 2,
                    c: {
                        aa: 11,
                        bb: 22,
                    },
                },
                tag: {
                    a: 'a0',
                    b: 'b0',
                },
                id: 1000,
            });
            console.dir(list);
            //得到: 
            [
                { keys: ['name', 'a'], value: 1 },
                { keys: ['name', 'b'], value: 2 },
                { keys: ['name', 'c', 'aa'], value: 11 },
                { keys: ['name', 'c', 'bb'], value: 22 },
                { keys: ['tag', 'a'], value: 'a0' },
                { keys: ['tag', 'b'], value: 'b0' },
                { keys: ['id'], value: 1000 },
            ]
        */
        flat(obj) {
            let isPlain = exports.isPlain;
            let list = [];
    
            if (!obj || !isPlain(obj)) {
                return list;
            }
    
    
            let keys = [];
    
            /**
            * @inner
            * 内部使用的迭代函数。
            * @param {Object} obj 要进行迭代的对象。
            * @param {number} level 用来跟踪当前迭代键值所处的层次深度，辅助用的。
            */
            function each(obj, level) {
                for (let key in obj) {
                    let value = obj[key];
    
                    keys = keys.slice(0, level);
                    keys.push(key);
    
                    if (isPlain(value)) {   //还是一个纯对象
                        each(value, level + 1);     //递归处理
                        continue;
                    }
    
                    //叶子结点
                    list.push({
                        'keys': keys,
                        'value': value
                    });
                }
            }
    
            each(obj, 0);
    
            return list;
        },
        /**
        * 使用过滤函数对指定的对象进行过滤数，返回一个新对象。
        * @param {Object} target 要进行过滤的对象。
        * @param {function} fn 过滤函数。
        *   过滤函数会接收到两个参数：当前对象中迭代中的 key 和 value。
        *   过滤函数必须明确返回 true 以保留该成员，其它值则删除该成员。
        * @return {Object} 返回一个过滤后的纯对象。
        */
        grep(target, fn) {
            let obj = {};
    
            for (let key in target) {
                let value = target[key];
                let test = fn(key, value);
    
                //只有回调函数中明确返回 true 才保留该成员。
                if (test === true) {
                    obj[key] = value;
                }
            }
    
            return obj;
        },
        /**
        * 对一个对象进行迭代。
        * 该方法可以代替 `for...in` 的语句。
        * 只有在回调函数中明确返回 false 才停止循环。
        * 已重载 each(obj, fn);
        * 已重载 each(deep, obj, fn);
        * @param {boolen} [deep=false] 
        *   指示是否要进行深层次的迭代，如果是，请指定 true；
        *   否则请指定 false 或不指定。 默认为 false，即浅迭代。
        * @param {Object} obj 要进行迭代处理的对象
        * @param {function} fn 要进行迭代处理的回调函数。
        *   该函数中会接收到当前对象迭代的到 key 和 value 作为参数。
        *   只有在此函数中明确返回 false 才会停止迭代。
        */
        each(deep, obj, fn) {
            //重载 each(obj, fn); 此时 deep 为 false。
            if (typeof deep != 'boolean') {
                fn = obj;
                obj = deep;
                deep = false;
            }
    
    
            for (let key in obj) {
                let value = obj[key];
                let test = fn(key, value, obj);
    
                // 只有在 fn 中明确返回 false 才停止循环。
                if (test === false) {
                    break;
                }
    
                //指定了深迭代，并且当前 value 为非 null 的对象。
                if (deep === true && value && typeof value == 'object') {
                    exports.each(true, value, fn); //递归
                }
            }
        },
    
        /**
        * 对一个对象进行迭代。
        * 该方法可以代替 `for...in` 的语句。
        * 只有在回调函数中明确返回 false 才停止循环。
        * 已重载 each(obj, fn);
        * @param {boolen} [deep=false] 指示是否要进行深层次的迭代。
        *   如果是，请指定 true；
        *   否则请指定 false 或不指定。 默认为 false，即浅迭代。
        * @param {Object} obj 要进行迭代处理的对象。
        * @param {function} fn 要进行迭代处理的回调函数，该函数中会接收到当前对象迭代的到 key 和 value 作为参数。
        */
        map(deep, obj, fn) {
            //重载 map(obj, fn); 此时 deep 为 false。
            if (typeof deep != 'boolean') {
                fn = obj;
                obj = deep;
                deep = false;
            }
    
            let isPlain = exports.isPlain;
            let map = exports.map;
            let target = {};
    
            for (let key in obj) {
                let value = obj[key];
    
                //指定了深迭代，并且当前 value 为纯对象。
                if (deep && isPlain(value)) {
                    target[key] = map(true, value, fn); //递归
                }
                else {
                    target[key] = fn(key, value, obj);
                }
            }
    
            return target;
        },
        /**
        * 用指定的多个键和单个值组合生成一个深层次的对象。
        * 已重载 make(keys, value);        //没有显式提供一个容器对象，则内部提供一个空的。
        * 已重载 make(obj, keys, value);   //使用指定的容器对象。
        * 如：make(['A', 'B', 'C'], 100) => { A: { B: { C: 100, }, }, }
        * 参数：
        *   obj: {},    //容器对象。 如果(可以)不指定，则内部提供一个空白的全新对象。
        *   keys: [],   //键列表。 如 ['A', 'B', 'C']。
        *   value: any, //值。
        */
        make(obj, keys, value) {
            //重载 make(keys, value);
            //没有显式提供一个容器对象，则内部提供一个空的。
            if (Array.isArray(obj)) {
                value = keys;
                keys = obj;
                obj = {};
            }
    
            if (!obj || typeof obj != 'object') {
                throw new Error('参数 obj 必须为一个非空的对象，以作为容器对象。');
            }
    
            let item = obj;
            let maxIndex = keys.length - 1; //判断是否为最后一个。
    
            //依次组装。
            keys.map(function (key, index) {
                let old = item[key];
    
                //非最后一项，则保证创建一个 {} 作为容器。
                //这意味着，如果原来的值不是对象，则会因为给新的 {} 覆盖而丢失。
                if (index < maxIndex) {
                    item = item[key] = (typeof old == 'object') ? old || {} : {};
                }
                else { //最后一项，直接赋值。
                    item[key] = value;
                }
    
            });
    
            return obj;
        },
        /**
        * 对一个对象进行成员过滤，返回一个过滤后的新对象。
        * 该方法可以以某个模板对指定对象进行成员拷贝。
        * @param {Object} src 要进行拷贝的对象，即数据来源。
        * @param {Array|Object|string} samples 要拷贝的成员列表(模板)。
        * @return {Object} 返回一个过滤后的新对象。
        * @example
            var src = {
                a: 100,
                b: 200,
                c: 300,
                d: 400
            };
     
            var samples = {
                a: 1,
                b: 2
            };
     
            //或 samples = ['a', 'b'];
     
            var obj = $Object.filter(src, samples);
            console.dir(obj); //得到 obj = { a: 100, b: 200 }; 只保留 samples 中指定的成员，其他的去掉.
        */
        filter(src, samples) {
            let obj = {};
    
            if (Array.isArray(samples)) {
                samples.forEach(function (key, index) {
                    if (key in src) {
                        obj[key] = src[key];
                    }
                });
            }
            else if (exports.isPlain(samples)) {
                exports.each(samples, function (key, value) {
                    if (key in src) {
                        obj[key] = src[key];
                    }
                });
            }
            else if (typeof samples == 'string') {
                let key = samples;
                if (key in src) {
                    obj[key] = src[key];
                }
            }
            else {
                throw new Error('无法识别参数 samples 的类型');
            }
    
            return obj;
        },
        /**
        * 删除对象中指定的成员，返回一个新对象。
        * 指定的成员可以以单个的方式指定，也可以以数组的方式指定(批量)。
        * @param {Object} obj 要进行处理的对象。
        * @param {String|Array|Object} keys 要删除的成员名称，可以是单个，也可以是批量。
        * @return {Object} 返回一个被删除相应成员后的新对象。
        * @example
            var obj = {
                a: 1, 
                b: 2, 
                c: 3
            };
    
            var o = $Object.delete(obj, ['a', 'c']); //移除成员 a 和 c 
            console.dir(o); //得到 o = { b: 2 };
    
            o = $Object.delete(obj, {a: 1, b: 2});
            console.dir(o); //得到 o = { c: 3 };
        */
        delete(obj, keys) {
            let target = Object.assign({}, obj); //浅拷贝一份
    
            if (typeof keys == 'string') {
                delete target[keys];
            }
            else if (Array.isArray(keys)) {
                for (let i = 0, len = keys.length; i < len; i++) {
                    delete target[keys[i]];
                }
            }
            else {
                for (let key in keys) {
                    delete target[key];
                }
            }
    
            return target;
        },
    
        /**
        * 对一个对象的键进行排序，返回一个新的对象。
        * 已重载 sort(obj);
        * 已重载 sort(obj, sort);
        * 已重载 sort(deep, obj);
        * 已重载 sort(deep, obj, sort);
        * @param {boolen} [deep=false] 指示是否要进行深层次的迭代。
        *   如果是，请指定 true；
        *   否则请指定 false 或不指定。 默认为 false，即浅迭代。
        * @param {Object} obj 要进行迭代处理的对象。
        * @param {function} [sort] 可选的排序函数。
        */
        sort(deep, obj, sort) {
            //重载 sort(obj, sort);
            if (typeof deep != 'boolean') {
                sort = obj;
                obj = deep;
                deep = false;
            }
    
            if (!obj) {
                return obj;
            }
    
    
            sort = sort || undefined; //这里要用 undefined。
    
    
            let target = {};
    
            Object.keys(obj).sort(sort).forEach((key) => {
                let value = obj[key];
    
                if (deep && exports.isPlain(value)) {
                    value = exports.sort(deep, value, sort);
                }
    
                target[key] = value;
            });
    
            return target;
    
        },
    };
});
/**
* src: @definejs/app-module/modules/AppModule.defaults.js
* pkg: @definejs/app-module@1.0.0
*/
define('AppModule.defaults', function (require, module, exports) { 
    
    const Emitter = require('Emitter');
    
    
    module.exports = {
        Emitter,   //事件驱动器。
    
        seperator: '/',     //私有模块的分隔符。
        repeated: false,    //不允许重复定义同名的模块。
        cross: false,       //不允许跨级加载模块。
    };
});
/**
* src: @definejs/app-module/modules/AppModule.js
* pkg: @definejs/app-module@1.0.0
*/
define('AppModule', function (require, module, exports) { 
    const ModuleManager = require('ModuleManager');
    const $Object = require('Object');
    const $String = require('String');
    
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
        defaults: require('AppModule.defaults'),
    
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
});
/**
* src: @definejs/emitter/modules/Emitter.js
* pkg: @definejs/emitter@1.0.0
*/
define('Emitter', function (require, module, exports) { 
    
    const $Object = require('Object');
    const Tree = require('Tree');
    
    const mapper = new Map();
    
    class Emitter {
        /**
        * 构造器。
        * @param {Object} [context=null] 事件处理函数中的 this 上下文对象。
        *   如果不指定，则默认为 null。
        */
        constructor(context) {
            let meta = {
                'context': context,
                'tree': new Tree(),
            };
    
            mapper.set(this, meta);
        }
    
        /**
        * 绑定指定名称的事件处理函数。
        * 已重载 on({...});
        * 已重载 on(name0, name1, ..., nameN, {...});
        * 已重载 on(name0, name1, ..., nameN, fn);
        * 已重载 on(args); 主要是为了方便调用方快速重绑定自己的 on() 方法。
        * 已重载 on(names, fn); 把多个事件名称绑定到同一个回调函数。
        * @param {string} name 要绑定的事件名称。
        * @param {function} fn 事件处理函数。 
            在处理函数内部， this 指向构造器参数 context 对象。
        * @example
            var emitter = new Emitter();
            emitter.on('click', function () {});
        */
        on(name, fn) {
            //重载 on([])。
            if (Array.isArray(name)) {
                if (fn) { //重载 on(names, fn); 把多个事件名称绑定到同一个回调函数。
                    name.map(function (name) {
                        this.on(name, fn);
                    }, this);
                }
                else {  //重载 on(args); 主要是为了方便调用方快速重绑定自己的 on() 方法。
                    this.on(...name);
                }
    
                return;
            }
    
    
            let meta = mapper.get(this);
            let tree = meta.tree;
            let args = Array.from(arguments);
    
            //重载 on(name0, name1, ..., nameN, {...}) 的情况。
            //先尝试找到 {} 所在的位置。
            let index = args.findIndex(function (item, index) {
                return typeof item == 'object';
            });
    
            if (index >= 0) {
                let obj = args[index];
                let names = args.slice(0, index);   //前缀部分 [name0, name1, ..., nameN]。
                let list = $Object.flat(obj);       //{} 部分扁平化。
    
                list.forEach(function (item, index) {
                    let keys = names.concat(item.keys);
    
                    let node = tree.get(keys) || {
                        'list': [],         //本节点的回调列表。
                        'count': 0,         //本节点触发的次数计数。
                    };
    
                    node.list.push(item.value);
                    tree.set(keys, node);
                });
    
                return;
            }
    
    
            //重载 on(name0, name1, ..., nameN, fn) 的情况。
            //尝试找到回调函数 fn 所在的位置。
            index = args.findIndex(function (item, index) {
                return typeof item == 'function';
            });
    
            if (index < 0) {
                throw new Error('参数中必须指定一个回调函数');
            }
    
            fn = args[index]; //回调函数
    
            let names = args.slice(0, index); //前面的都当作是名称
    
            let node = tree.get(names) || {
                'list': [],         //本节点的回调列表。
                'count': 0,         //本节点触发的次数计数。
                'enabled': true,    //当为 false 时，表示本节点的回调被禁用。
                'spreaded': true,   //当为 false 时，表示子节点的回调被禁用。
            };
    
            node.list.push(fn);
            tree.set(names, node);
        }
    
        /**
        * 解除绑定指定名称的事件处理函数。
        * 已重载 off() 的情况。
        * 已重载 off(name0, name1, ..., nameN, {...}) 的情况。
        * 已重载 off(name0, name1, ..., nameN, fn) 的情况。
        * 已重载 off(name0, name1, ..., nameN) 的情况。
        * @param {string} [name] 要解除绑定的事件名称。
            如果不指定该参数，则移除所有的事件。
            如果指定了该参数，其类型必须为 string，否则会抛出异常。
        * @param {function} [fn] 要解除绑定事件处理函数。
            如果不指定，则移除 name 所关联的所有事件。
        */
        off(name, fn) {
            var meta = mapper.get(this);
            var tree = meta.tree;
            var args = Array.from(arguments);
    
            //未指定事件名，则移除所有的事件。
            if (args.length == 0) {
                tree.clear();
                return;
            }
    
            //多名称情况: off(name0, name1, ..., nameN, {});
            //先尝试找到 {} 所在的位置。
            var index = args.findIndex(function (item, index) {
                return typeof item == 'object';
            });
    
            if (index >= 0) {
                var obj = args[index];              //{} 对象。
                var names = args.slice(0, index);   //前缀部分 [name0, name1, ..., nameN]。
                var list = $Object.flat(obj);       //{} 对象部分扁平化。
    
                list.forEach(function (item, index) {
                    var keys = names.concat(item.keys); //完整路径。
                    var node = tree.get(keys);          //该路径对应的节点。
    
                    //不存在该路径对应的节点。
                    if (!node) {
                        return;
                    }
    
                    //存在该路径对应的节点，但事件列表为空。
                    var list = node.list;
                    if (!list || !list.length) {
                        return;
                    }
    
                    var fn = item.value;
                    node.list = list.filter(function (item) {
                        return item !== fn;
                    });
                });
                return;
            }
    
    
            //重载 off(name0, name1, ..., nameN, fn) 的情况。
            //先尝试找到回调函数所在的位置。
            var index = args.findIndex(function (item, index) {
                return typeof item == 'function';
            });
    
            //未指定处理函数，则假定在边界之外。
            if (index < 0) {
                index = args.length;
            }
    
            fn = args[index]; //回调函数。
    
            var names = args.slice(0, index); //前面的都当作是名称。
            var node = tree.get(names);
    
            //不存在该路径对应的节点。
            if (!node) {
                return;
            }
    
            //存在该路径对应的节点，但事件列表为空。
            var list = node.list;
            if (!list || !list.length) {
                return;
            }
    
            if (fn) {
                node.list = list.filter(function (item, index) {
                    return item !== fn;
                });
            }
            else { //未指定处理函数，则清空列表
                list.length = 0;
            }
    
        }
    
        /**
        * 已重载。
        * 触发指定名称的事件，并可向事件处理函数传递一些参数。
        * @return {Array} 返回所有事件处理函数的返回值所组成的一个数组。
        * @example
            var emitter = new Emitter();
            emitter.on('click', 'name', function (a, b) {
                console.log(a, b);
            });
            emitter.fire('click', 'name', [100, 200]);
        */
        fire(name, params) {
            let meta = mapper.get(this);
            if (!meta) {
                console.log(arguments, this.id);
            }
    
            let context = meta.context;
            let args = [...arguments];
    
            let index = args.findIndex(function (item, index) {
                return Array.isArray(item);
            });
    
            if (index < 0) {
                index = args.length;
            }
    
            let names = args.slice(0, index);
            let node = meta.tree.get(names);
            let returns = [];
    
            if (!node) { //不存在该事件名对应的节点。
                return returns;
            }
    
            params = args[index] || [];
            node.count++;
    
            node.list.forEach(function (fn, index) {
                //让 fn 内的 this 指向 context，并收集返回值。
                let value = fn.apply(context, params);
                returns.push(value);
            });
    
            return returns;
    
        }
    
        /**
        * 判断是否已绑定了指定名称的事件。
        */
        has(...names) {
            let meta = mapper.get(this);
            let node = meta.tree.get([...names]);
    
            return node && node.list && node.list.length > 0;
        }
    
        /**
        * 设置指定的属性为指定的值。
        * 如可以在触发事件前动态改变 context 值。
        */
        set(key, value) {
            let meta = mapper.get(this);
    
            switch (key) {
                case 'context':
                    meta[key] = value;
                    break;
    
                default:
                    throw new Error('不支持设置属性: ' + key);
            }
    
        }
    
        /**
        * 销毁本实例对象。
        */
        destroy() {
            let meta = mapper.get(this);
            meta.tree.destroy();
            mapper.delete(this);
        }
    }
    
    /**
    * 
    */
    module.exports = Emitter;
    
});
/**
* src: @definejs/tree/modules/Tree/Node.js
* pkg: @definejs/tree@1.0.0
*/
define('Tree/Node', function (require, module, exports) { 
    
    
    let counter = 0;
    
    
    module.exports = exports = {
    
        create(keys = [], parent = null) { 
            
            let key = keys.slice(-1)[0];
            let id = `node-${counter++}`;
            let depth = keys.length;
            let siblings = parent ? parent.nodes : [];
    
    
            return {
                'id': id,                   //全局 id。
                'y': depth,                 //当前层级的深度。
                'x': 0,                     //在兄弟节点列表中的索引号（排名）。
                'key': key || '',           //当前的 key，方便后续处理。
                'keys': keys,               //从根节点到当前节点的完整路径，方便后续处理。
                'parent': parent,           //父节点。 如果为 null，则表示当前节点为根节点。
                'isRoot': !parent,          //是否为根节点。
                'key$node': {},             //子节点的容器对象。 如果为空对象 {}，则表示当前节点为叶子节点。
                'nodes': [],                //子节点列表。 如果为空数组 []，则表示当前节点为叶子节点。
                'siblings': siblings,       //兄弟节点列表。 包括自己在内。
                //'value': undefined,       //会有一个这样的字段，但先不创建。
            };
        },
    
        set(node, keys, value) { 
            let parent = node;
            let maxIndex = keys.length - 1;
            let newNodes = [];
    
    
            keys.forEach(function (key, index) {
                let node = parent.key$node[key];
    
                //尚未存在该节点，则先创建。
                if (!node) {
                    let sliceKeys = keys.slice(0, index + 1);//从根节点到当前节点的完整路径，方便后续处理。
    
                    node = exports.create(sliceKeys, parent);
                    
                    parent.key$node[key] = node;
                    parent.nodes.push(node);
                    newNodes.push(node);
    
                    node.x = node.siblings.length - 1;
                    
                }
    
                if (index < maxIndex) {//准备下一轮迭代。
                    parent = node;
                }
                else { //最后一项。
                    node.value = value;
                }
            });
    
            return newNodes;
        },
    
    
        get(node, keys) {
            let { key$node, } = node;
            let maxIndex = keys.length - 1;
    
            for (let index = 0; index <= maxIndex; index++) {
                let key = keys[index];
                let node = key$node[key];
    
                if (!node || index == maxIndex) { //不存在了，或是最后一项了。
                    return node || null;
                }
    
                key$node = node.key$node; //准备下一轮迭代。
            }
        },
    
        each(node, fn) {
            let { nodes, } = node;
    
            //叶子节点。
            if (!nodes.length) {
                return;
            }
    
    
            nodes.some((node) => { 
                let value = fn(node);
    
                // 只有在 fn 中明确返回 false 才停止循环。
                if (value === false) {
                    return true;
                }
    
                exports.each(node, fn); //递归。
            });
    
            
        },
    };
});
/**
* src: @definejs/tree/modules/Tree.js
* pkg: @definejs/tree@1.0.0
*/
define('Tree', function (require, module, exports) { 
    
    const Node = module.require('Node');
    
    const mapper = new Map();
    
    
    /**
    * 树形结构的存储类。
    * 
    */
    class Tree {
        /**
        * 构造器。
        * @param {Array} [list] 可选，要解析的类文件路径列表。
        * @param {string} [seperator] 可选，类文件路径里的分隔符，如 `/`。
        */
        constructor(list, seperator) {
            let root = Node.create();
    
            const meta = {
                'root': root,
                'nodes': [],    //整棵树的所有节点列表。
                'id$node': {},  //
                'this': this,
            };
    
            mapper.set(this, meta);
    
            if (Array.isArray(list)) {
                seperator = seperator || '/';
    
                list.forEach((item) => {
                    let keys = item.split(seperator);
                    meta.this.set(keys);
                });
            }
    
        }
    
        /**
        * 渲染树为文本形式的图形结构。
        * @param {Array} 
        */
        render(keys = []) {
            let id$info = {};
            let lines = [];
            let TAB = Array(4 + 1).join(` `);
    
            this.each(keys, function (node) {
                let { id, x, y, key, siblings, parent, } = node;
                let hasNextSibling = x < siblings.length - 1;       //
                let linker = hasNextSibling ? `├──` : `└──`;        //
                let content = `${linker} ${key}`;                   //如 `├── Main`
                let tabs = y > 1 ? Array(y).join(TAB) : ``;         //缩进量。 根据当前节点所处的层级决定。
    
    
                if (parent && !parent.isRoot) {
                    let p = id$info[parent.id];
                    let c = p.hasNextSibling ? `│` : ``;
    
                    tabs = p.tabs + c + TAB.slice(1);
                }
    
    
                id$info[id] = {
                    hasNextSibling,
                    tabs,
                    content,
                };
    
                lines.push(`${tabs}${content}`);
    
            });
    
            return lines;
        }
    
    
        /**
        * 设置指定节点上的值。
        * 如果不存在该节点，则先创建，然后存储值到上面；否则直接改写原来的值为指定的值。
        * @param {Array} keys 节点路径数组。
        * @param value 要设置的值。
        * @example
        *   tree.set(['path', 'to'], 123);
        */
        set(keys, value) {
            let meta = mapper.get(this);
            let nodes = Node.set(meta.root, keys, value);
    
            nodes.forEach((node) => {
                let { id, } = node;
    
                meta.id$node[id] = node;
                meta.nodes.push(node);
            });
    
    
        }
    
        /**
        * 获取指定路径的节点上的值。
        * @return 返回该节点上的值。 如果不存在该节点，则返回 undefined。
        * @example
        *   tree.get(['path', 'to']); //获取路径为 'path' -> 'to' 的节点上存储的值。
        */
        get(keys) {
            let meta = mapper.get(this);
            let node = Node.get(meta.root, keys);
    
            return node ? node.value : undefined;
        }
    
        /**
        * 判断是否存在指定路径的节点。
        * @param {Array} keys 节点路径数组。
        */
        has(keys) {
            let meta = mapper.get(this);
            let node = Node.get(meta.root, keys);
    
            return !!node;
        }
    
    
        /**
        * 对整棵树或指定节点开始的子树中的所有节点进行迭代执行一个回调函数。
        * 已重载 each(fn); //对整棵树进行迭代。
        * 已重载 each(keys, fn); //对指定的节点开始的子树进行迭代。
        * @param {Array} keys 节点路径数组。
        * @param {function} fn 迭代时要执行的回调函数。
        *   在回调函数中明确返回 false 会中止迭代。
        * 
        */
        each(keys, fn) {
            //重载 each(fn);  
            //对整棵树进行迭代。
            if (typeof keys == 'function') {
                fn = keys;
                keys = [];
            }
           
    
            if (typeof fn != 'function') {
                throw new Error(`参数 fn 必须为一个函数。`);
            }
    
    
            let meta = mapper.get(this);
            let root = meta.root;
            let node = keys.length > 0 ? Node.get(root, keys) : root;
    
            if (!node) {
                throw new Error(`不存在路径为 ${keys.join('.')} 的节点。`);
            }
    
            Node.each(node, fn);
        }
    
        /**
        * 清空全部节点及数据。
        */
        clear() {
            let meta = mapper.get(this);
    
            meta.root = Node.create([], null);
            meta.nodes = [];
            meta.id$node = {};
        }
    
        /**
        * 删除指定节点上的值。
        */
        remove(keys) {
            let meta = mapper.get(this);
            let node = Node.get(meta.root, keys);
    
            if (!node) { //不存在该节点
                return;
            }
    
            delete node.value; //仅删除值，子节点不受影响。
        }
    
        /**
        * 销毁。
        */
        destroy() {
            mapper.delete(this);
        }
    }
    
    module.exports = Tree;
    
});
/**
* src: @definejs/string/modules/String.js
* pkg: @definejs/string@1.0.0
*/
define('String', function (require, module, exports) { 
    
    /**
     * 字符串工具。
     */
    module.exports = exports = {
        /**
        * 用指定的值去填充一个字符串模板。
        * @param {String} str 要进行填充的字符串模板。
        * @param {Object} obj 要填充的键值对的数据对象。
        * @return 返回一个用值去填充后的字符串。
        * @example
        *   $String.format('{id},{type}', {id: 1, type: 'app'}); //返回 `1,app`
        *   $String.format('{2}{0}{1}', 'a', 'b', 'c'); //返回 `cab`
        */
        format(str, obj) {
            let s = str;
            let replaceAll = exports.replaceAll;
    
            //一个内部的填充函数。
            let fill = (str, key, value) => { 
                if (Array.isArray(value)) {
                    value = value.join('');
                }
    
                str = replaceAll(str, `{${key}}`, value);
                return str;
            };
    
            if (typeof obj == 'object') {
                for (let key in obj) {
                    s = fill(s, key, obj[key]);
                }
            }
            else {
                let args = [...arguments].slice(1);
    
                args.forEach(function (index, item) { 
                    s = fill(s, index, item);
                });
            }
    
            return s;
        },
    
        /**
        * 对字符串进行全局替换。
        * @param {String} target 要进行替换的目标字符串。
        * @param {String} src 要进行替换的子串，旧值。
        * @param {String} dest 要进行替换的新子串，新值。
        * @return {String} 返回一个替换后的字符串。
        * @example
        *   $String.replaceAll('abcdeabc', 'bc', 'BC') //结果为 aBCdeBC
        */
        replaceAll(target, src, dest) {
            return target.split(src).join(dest);
        },
    
    
        /**
        * 对字符串进行区间内的替换。
        * 该方法会把整个区间替换成新的字符串，包括区间标记。
        * 已重载 replaceBetween(s, { begin, end, value, });
        * @param {String} s 要进行替换的目标字符串。
        * @param {String} beginTag 区间的开始标记。
        * @param {String} endTag 区间的结束标记
        * @param {String} value 要进行替换的新子串，新值。
        * @return {String} 返回一个替换后的字符串。
        *   当不存在开始标记或结束标记时，都会不进行任何处理而直接返回原字符串。
        * @example
        *   $String.replaceBetween('hello #--world--# this is #--good--#', '#--', '--#', 'javascript') 
        *   //结果为 'hello javascript this is javascript'
        */
        replaceBetween(s, beginTag, endTag, value) {
            //重载 replaceBetween(s, opt);
            if (typeof beginTag == 'object') {
                let opt = beginTag;
                beginTag = opt.begin;
                endTag = opt.end;
                value = opt.value;
            }
    
    
            if (s.indexOf(beginTag) < 0 || s.indexOf(endTag) < 0) {
                return s;
            }
    
            let list = s.split(beginTag).map(function (item) {
                let a = item.split(endTag);
    
                if (a.length == 1) {
                    return a[0];
                }
    
                return value + a.slice(1).join(endTag);
    
            });
    
    
            s = list.join('');
    
            return s;
    
        },
    
    
        /**
        * 右对齐此实例中的字符，在左边用指定的 Unicode 字符填充以达到指定的总长度。
        * 当指定的总长度小实际长度时，将从右边开始算起，做截断处理，以达到指定的总长度。
        * @param {String} str 要进行填充对齐的字符串。
        * @param {Number} totalWidth 填充后要达到的总长度。
        * @param {String} paddingChar 用来填充的模板字符串。
        * @return {String} 返回一个经过填充对齐后的新字符串。
        * @example
        *   $String.padLeft('1234', 6, '0'); //结果为 '001234'，右对齐，从左边填充 '0'
        *   $String.padLeft('1234', 2, '0'); //结果为 '34'，右对齐，从左边开始截断
        */
        padLeft(str, totalWidth, paddingChar) {
            str = String(str); //转成字符串
    
            let len = str.length;
            if (totalWidth <= len) { //需要的长度短于实际长度，做截断处理
                return str.substr(-totalWidth); //从后面算起
            }
    
            paddingChar = paddingChar || ' ';
    
            let arr = [];
            arr.length = totalWidth - len + 1;
    
            return arr.join(paddingChar) + str;
        },
    
    
        /**
        * 左对齐此字符串中的字符，在右边用指定的 Unicode 字符填充以达到指定的总长度。
        * 当指定的总长度小实际长度时，将从左边开始算起，做截断处理，以达到指定的总长度。
        * @param {String} str 要进行填充对齐的字符串。
        * @param {Number} totalWidth 填充后要达到的总长度。
        * @param {String} paddingChar 用来填充的模板字符串。
        * @return {String} 返回一个经过填充对齐后的新字符串。
        * @example
        *   $String.padLeft('1234', 6, '0'); //结果为 '123400'，左对齐，从右边填充 '0'
        *   $String.padLeft('1234', 2, '0'); //结果为 '12'，左对齐，从右边开始截断
        */
        padRight(str, totalWidth, paddingChar) {
            let s = String(str); //转成字符串
            let len = s.length;
    
            if (len >= totalWidth) {
                return s.substring(0, totalWidth);
            }
    
            paddingChar = paddingChar || ' ';
    
            let arr = [];
            arr.length = totalWidth - len + 1;
    
    
            return s + arr.join(paddingChar);
        },
    
        /**
        * 获取位于两个标记子串之间的子字符串。
        * @param {String} str 要进行获取的大串。
        * @param {String} beginTag 区间的开始标记。
        * @param {String} endTag 区间的结束标记。
        * @return {String} 返回一个子字符串。当获取不能结果时，统一返回空字符串。
        * @example
        *   $String.between('abc{!hello!} world', '{!', '!}'); //结果为 'hello' 
        */
        between(str, beginTag, endTag) {
            let startIndex = str.indexOf(beginTag);
            if (startIndex < 0) {
                return '';
            }
    
            startIndex += beginTag.length;
    
            let endIndex = str.indexOf(endTag, startIndex);
    
            if (endIndex < 0) {
                return '';
            }
    
            return str.substr(startIndex, endIndex - startIndex);
        },
    
        /**
        * 产生指定格式或长度的随机字符串。
        * @param {String|int} [formater=12] 随机字符串的格式，或者长度（默认为12个字符）。
        *   格式中的每个随机字符用 'x' 来占位，如 'xxxx-1x2x-xx'
        * @return {String} 返回一个指定长度的随机字符串。
        * @example
        *   $String.random();      //返回一个 12 位的随机字符串
        *   $String.random(64);    //返回一个 64 位的随机字符串
        *   $String.random('xxxx-你好xx-xx'); //类似 'A3EA-你好B4-DC'
        */
        random(formater) {
            if (formater === undefined) {
                formater = 12;
            }
    
            //如果传入的是数字，则生成一个指定长度的格式字符串 'xxxxx...'
            if (typeof formater == 'number') {
                let size = formater + 1;
                if (size < 0) {
                    size = 0;
                }
    
                formater = [];
                formater.length = size;
                formater = formater.join('x');
            }
    
            return formater.replace(/x/g, function (c) {
                let r = Math.random() * 16 | 0;
                return r.toString(16);
            }).toUpperCase();
        },
    
        /**
        * 根据指定的规则生成一个随机 id。
        */
        randomId(...list) {
    
            list = list.map(function (item, index) {
    
                if (typeof item == 'number') {
                    item = exports.random(item);
                    item = item.toLowerCase();
                }
    
                return item;
            });
    
            return list.join('');
    
        },
    
    
        //---------------转换部分 -----------------------------------------------------
    
        /**
        * 把一个字符串转成骆驼命名法。。
        * 如 'font-size' 转成 'fontSize'。
        * @param {String} str 要进行转换的字符串。
        * @return 返回一个骆驼命名法的新字符串。
        * @example
        *   $String.toCamelCase('background-item-color') //结果为 'backgroundItemColor'
        */
        toCamelCase(str) {
            let rmsPrefix = /^-ms-/;
            let rdashAlpha = /-([a-z]|[0-9])/ig;
    
            return str.replace(rmsPrefix, 'ms-').replace(rdashAlpha, function (all, letter) {
                return letter.toString().toUpperCase();
            });
    
            /* 下面的是 mootool 的实现
            return str.replace(/-\D/g, function(match) {
                return match.charAt(1).toUpperCase();
            });
            */
        },
    
        /**
        * 把一个字符串转成短线连接法。
        * 如 fontSize 转成 font-size
        * @param {String} str 要进行转换的字符串。
        * @return 返回一个用短线连接起来的新字符串。
        * @example
        *   $String.toHyphenate('backgroundItemColor') //结果为 'background-item-color'
        */
        toHyphenate(str) {
            return str.replace(/[A-Z]/g, function (match) {
                return ('-' + match.charAt(0).toLowerCase());
            });
        },
    
        /**
        * 把一个字符串转成 UTF8 编码。
        * @param {String} str 要进行编码的字符串。
        * @return {String} 返回一个 UTF8 编码的新字符串。
        * @example
        *   $String.toUtf8('你好'); //结果为 ''
        */
        toUtf8(str) {
            let a = [];
    
            str.split('').forEach(function (ch, index) {
                let code = ch.charCodeAt(0);
    
                if (code < 0x80) {
                    a.push(code);
                }
                else if (code < 0x800) {
                    a.push(((code & 0x7C0) >> 6) | 0xC0);
                    a.push((code & 0x3F) | 0x80);
                }
                else {
                    a.push(((code & 0xF000) >> 12) | 0xE0);
                    a.push(((code & 0x0FC0) >> 6) | 0x80);
                    a.push(((code & 0x3F)) | 0x80);
                }
            });
    
            a = a.map(function (item, index) {
                return item.toString(16);
            });
    
            return '%' + a.join('%');
        },
    
    
        /**
        * 把一个字符串转成等价的值。
        * 主要是把字符串形式的 0|1|true|false|null|undefined|NaN 转成原来的数据值。
        * 当参数不是字符串或不是上述值之一时，则直接返回该参数，不作转换。
        * @param {Object} value 要进行转换的值，可以是任何类型。
        * @return {Object} 返回一个等价的值。
        * @example
        *   $String.toValue('NaN') //NaN
        *   $String.toValue('null') //null
        *   $String.toValue('true') //true
        *   $String.toValue('false') //false
        *   $String.toValue({}) //不作转换，直接原样返回
        */
        toValue(value) {
            if (typeof value != 'string') { //拦截非字符串类型的参数
                return value;
            }
    
            let maps = {
                //'0': 0,
                //'1': 1,
                'true': true,
                'false': false,
                'null': null,
                'undefined': undefined,
                'NaN': NaN
            };
    
            return value in maps ? maps[value] : value;
    
        },
    
        //---------------分裂和提取部分 -----------------------------------------------------
    
        /**
        * 对一个字符串进行多层次分裂，返回一个多维数组。
        * @param {String} str 要进行分裂的字符串。
        * @param {Array} separators 分隔符列表数组。
        * @return {Array} 返回一个多维数组，该数组的维数，跟指定的分隔符 separators 的长度一致。
        * @example
            var str = 'a=1&b=2|a=100&b=200;a=111&b=222|a=10000&b=20000';
            var separators = [';', '|', '&', '='];
            var a = $String.split(str, separators);
            //结果 a 为
            a = 
            [                           // ';' 分裂的结果
                [                       // '|'分裂的结果
                    [                   // '&'分裂的结果
                        ['a', '1'],     // '='分裂的结果
                        ['b', '2']
                    ],
                    [
                        ['a', '100'],
                        ['b', '200']
                    ]
                ],
                [
                    [
                        ['a', '111'],
                        ['b', '222']
                    ],
                    [
                        ['a', '10000'],
                        ['b', '20000']
                    ]
                ]
            ];
        * 
        */
        split(str, separators) {
            let list = String(str).split(separators[0]);
    
            for (let i = 1, len = separators.length; i < len; i++) {
                list = fn(list, separators[i], i);
            }
    
            return list;
    
    
            //一个内部方法
            function fn(list, separator, dimension) {
                dimension--;
    
                return list.map(function (item, index) {
                    return dimension == 0 ?
                        String(item).split(separator) :
                        fn(item, separator, dimension); //递归
                });
            }
    
    
        },
    
    
        /**
        * 获取一个字符串的字节长度。
        * 普通字符的字节长度为 1；中文等字符的字节长度为 2。
        * @param {String} s 要进行解析的字符串。
        * @return {Number} 返回参数字符串的字节长度。
        */
        getByteLength(s) {
            if (!s) {
                return 0;
            }
    
            return s.toString().replace(/[\u0100-\uffff]/g, '  ').length;
        },
    };
});
/**
* src: @definejs/array/modules/Array.js
* pkg: @definejs/array@1.0.0
*/
define('Array', function (require, module, exports) { 
    
    /**
    * 数组工具。
    */
    module.exports = exports = {
        /**
        * 把一个数组中的元素转换到另一个数组中，返回一个新的数组。
        * 已重载 map(array, fn);
        * 已重载 map(deep, array, fn);
        * @param {boolean} [deep=false] 指定是否进行深层次迭代。
        *   如果要进行深层次迭代，即对数组元素为数组继续迭代的，请指定 true；否则为浅迭代。
        * @param {Array} array 要进行转换的数组。
        * @param {function} fn 转换函数。
        *   该转换函数会为每个数组元素调用，它会接收到两个参数：当前迭代的数组元素和该元素的索引。
        *   转换函数可以返回转换后的值，有两个特殊值影响到迭代行为：
        *   null：忽略当前数组元素，即该元素在新的数组中不存在对应的项（相当于 continue）；
        *   undefined：忽略当前数组元素到最后一个元素（相当于break）；
        * @return {Array} 返回一个转换后的新数组。
        */
        map(deep, array, fn) {
            //重载 map(array, fn); 此时 deep 为 false。
            if (typeof deep != 'boolean') {
                fn = array;
                array = deep;
                deep = false;
            }
    
            let map = exports.map; //引用自身，用于递归
            let list = [];
    
            for (let i = 0, len = array.length; i < len; i++) {
                let item = array[i];
                let value;
    
                if (deep === true && Array.isArray(item)) {
                    value = map(true, item, fn); // 此时的 value 是一个 []。
                }
                else {
                    value = fn(item, i);
    
                    //忽略掉 null 值的项。
                    if (value === null) {
                        continue;
                    }
    
                    //注意，当回调函数 fn 不返回值时，迭代会给停止掉。
                    if (value === undefined) { 
                        break;
                    }
                }
    
                list.push(value);
            }
    
            return list;
        },
    
        /**
        * 用滑动窗口的方式创建分组，即转成二维数组。
        * @param {Array} array 要进行切割的原数组。
        * @param {Number} windowSize 窗口大小。
        * @param {Number} [stepSize=1] 步长。 默认为 1。
        * @returns {Array} 返回一个二维数组。
        * @example
        *   $Array.slide(['a', 'b', 'c', 'd', 'e'], 3, 1); 
        *   返回结果（窗口大小为 3，移动步长为 1）：
        *   [
        *       ['a', 'b', 'c'],
        *       ['b', 'c', 'd'],
        *       ['c', 'd', 'e'],
        *   ]
        */
        slide(array, windowSize, stepSize = 1) {
            let len = array.length;
    
            //只够创建一组
            if (len <= windowSize) {
                return [array];
            }
    
    
            let groups = [];
    
            for (let i = 0; i < len; i = i + stepSize) {
                let end = i + windowSize;
                let a = array.slice(i, end);
    
                groups.push(a);
    
                if (end >= len) {
                    break; //已达到最后一组
                }
            }
    
            return groups;
        },
    
        /**
        * 创建分组，即转成二维数组。
        * @param {Array} array 要进行切割的原数组。
        * @param {Number} size 分组大小。
        * @param {boolean} isPadRight 是否向右对齐数据。
        * @returns {Array} 返回一个二维数组。
        * @example
        *   $Array.group(['a', 'b', 'c', 'd', 'e'], 3);
        *   返回结果（窗口大小为 3，移动步长为 3）：
        *   [
        *       ['a', 'b', 'c'],
        *       ['d', 'e'],
        *   ]
        * 
        *   $Array.group(['a', 'b', 'c', 'd', 'e'], 3, true); 
        *   则返回：
        *   [
        *       ['a', 'b'],
        *       ['c', 'd', 'e']
        *   ]
        *   
        */
        group(array, size, isPadRight) {
            let groups = exports.slide(array, size, size);
    
            if (isPadRight === true) {
                groups[groups.length - 1] = array.slice(-size); //右对齐最后一组
            }
    
            return groups;
        },
    
        /**
        * 产生一个区间为 [start, end) 的半开区间的数组。
        * 已重载 pad(start, end, step, fn);
        * 已重载 pad(start, end, fn);
        * 已重载 pad(start, end);
        * @param {number} start 半开区间的开始值。
        * @param {number} end 半开区间的结束值。
        * @param {number} [step=1] 填充的步长，默认值为 1。可以指定为负数。
        * @param {function} [fn] 转换函数。 会收到当前项和索引值作为参数。
        * @return {Array} 返回一个递增（减）的数组。
        *   当 start 与 end 相等时，返回一个空数组。
        * @example
            $Array.pad(2, 5); //产生一个从 2 到 5 的数组，步长为1，结果为[2, 3, 4]
            $Array.pad(1, 9, 2); //产生一个从1到9的数组，步长为2，结果为[1, 3, 5, 7]
            $Array.pad(5, 2, -1); //产生一个从5到2的数组，步长为-1，结果为[5, 4, 3]
            //下面的例子得到 [10, 20]
            $Array.pad(1, 3, function (item, index) {
                return item * 10;
            });
        */
        pad(start, end, step, fn) {
            if (start == end) {
                return [];
            }
    
            // 重载 pad(start, end, fn)
            if (typeof step == 'function') {
                fn = step;
                step = 1;
            }
            else {
                step = Math.abs(step || 1);
            }
    
    
            let a = [];
            let index = 0;
    
            if (start < end) { //升序
                for (let i = start; i < end; i += step) {
                    let item = fn ? fn(i, index) : i;
                    a.push(item);
                    index++;
                }
            }
            else { //降序
                for (let i = start; i > end; i -= step) {
                    let item = fn ? fn(i, index) : i;
                    a.push(item);
                    index++;
                }
            }
    
            return a;
    
        },
    };
});
/**
* src: @definejs/date/modules/Date.js
* pkg: @definejs/date@1.0.0
*/
define('Date', function (require, module, exports) { 
    const $String = require('String');
    
    let DELTA = 0; //用于存放参考时间(如服务器时间)和本地时间的差值。
    
    
    function getDateItem(s) {
        let separator =
            s.indexOf('.') > 0 ? '.' :
            s.indexOf('-') > 0 ? '-' :
            s.indexOf('/') > 0 ? '/' :
            s.indexOf('_') > 0 ? '_' : null;
    
        if (!separator) {
            return null;
        }
    
        let ps = s.split(separator);
    
        return {
            'yyyy': ps[0],
            'MM': ps[1] || 0,
            'dd': ps[2] || 1,
        };
    }
    
    function getTimeItem(s) {
        let separator = s.indexOf(':') > 0 ? ':' : null;
        
        if (!separator) {
            return null;
        }
    
        let ps = s.split(separator);
    
        return {
            'HH': ps[0] || 0,
            'mm': ps[1] || 0,
            'ss': ps[2] || 0,
        };
    }
    
    /**
    * 日期时间工具。
    */
    module.exports = exports = {
        /**
        * 把参数 value 解析成等价的日期时间实例。
        * @param {Date|String} value 要进行解析的参数，可接受的类型为：
        *   1.Date 实例
        *   2.String 字符串，包括调用 Date 实例的 toString 方法得到的字符串；也包括以下格式: 
        *       yyyy-MM-dd
        *       yyyy.MM.dd
        *       yyyy/MM/dd
        *       yyyy_MM_dd
        *       HH:mm:ss
        *       yyyy-MM-dd HH:mm:ss
        *       yyyy.MM.dd HH:mm:ss
        *       yyyy/MM/dd HH:mm:ss
        *       yyyy_MM_dd HH:mm:ss
        * @return 返回一个日期时间的实例。
        *   如果解析失败，则返回 null。
        * @example
        *   $Date.parse('2013-04-29 09:31:20');
        */
        parse(value) {
            //已经是一个 Date 实例，则判断它是否有值。
            if (value instanceof Date) {
                let tv = value.getTime();
                return isNaN(tv) ? null : value;
            }
    
            let isString = false;
    
            switch (typeof value) {
                case 'number':
                    let dt = new Date(value);
                    let tv = dt.getTime();
                    return isNaN(tv) ? null : dt;
    
                case 'string':
                    isString = true;
                    break;
    
            }
    
            if (!isString) {
                return null;
            }
    
    
            //标准方式
            let date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date;
            }
    
            /*
             自定义方式：
                yyyy-MM-dd
                yyyy.MM.dd
                yyyy/MM/dd
                yyyy_MM_dd
                HH:mm:ss
                yyyy-MM-dd HH:mm:ss
                yyyy.MM.dd HH:mm:ss
                yyyy/MM/dd HH:mm:ss
                yyyy_MM_dd HH:mm:ss
                    
            */
    
            let parts = value.split(' ');
            let left = parts[0];
    
            if (!left) {
                return null;
            }
    
            //冒号只能用在时间的部分，而不能用在日期部分
            date = left.indexOf(':') > 0 ? null : left;
            let time = date ? (parts[1] || null) : date;
    
            //既没指定日期部分，也没指定时间部分
            if (!date && !time) {
                return null;
            }
    
    
            if (date && time) {
                let d = getDateItem(date);
                let t = getTimeItem(time);
                return new Date(d.yyyy, d.MM - 1, d.dd, t.HH, t.mm, t.ss);
            }
    
            if (date) {
                let d = getDateItem(date);
                return new Date(d.yyyy, d.MM - 1, d.dd);
            }
    
            if (time) {
                let now = new Date();
                let t = getTimeItem(time);
                return new Date(now.getFullYear(), now.getMonth(), now.getDate(), t.HH, t.mm, t.ss);
            }
    
        },
    
        /**
        * 把日期时间格式化指定格式的字符串。
        * 已重载 format(formatter)。
        * @param {Date} datetime 要进行格式化的日期时间。
        *   如果不指定，则默认为当前时间，即 new Date()。
        * @param {string} formater 格式化的字符串。 其中保留的占位符有：
            'yyyy': 4位数年份
            'yy': 2位数年份
            'MM': 2位数的月份(01-12)
            'M': 1位数的月份(1-12)
            'dddd': '星期日|一|二|三|四|五|六'
            'dd': 2位数的日份(01-31)
            'd': 1位数的日份(1-31)
            'HH': 24小时制的2位数小时数(00-23)
            'H': 24小时制的1位数小时数(0-23)
            'hh': 12小时制的2位数小时数(00-12)
            'h': 12小时制的1位数小时数(0-12)
            'mm': 2位数的分钟数(00-59)
            'm': 1位数的分钟数(0-59)
            'ss': 2位数的秒钟数(00-59)
            's': 1位数的秒数(0-59)
            'tt': 上午：'AM'；下午: 'PM'
            't': 上午：'A'；下午: 'P'
            'TT': 上午： '上午'； 下午: '下午'
            'T': 上午： '上'； 下午: '下'
        * @return {string} 返回一个格式化的字符串。
        * @example
            //返回当前时间的格式字符串，类似 '2013年4月29日 9:21:59 星期一'
            $Date.format(new Date(), 'yyyy年M月d日 h:m:s dddd');
            $Date.format('yyyy年M月d日 h:m:s dddd');
        */
        format(datetime, formater) {
            //重载 format(formater);
            if (arguments.length == 1) {
                formater = datetime;
                datetime = new Date();
            }
            else {
                datetime = exports.parse(datetime);
            }
    
            let year = datetime.getFullYear();
            let month = datetime.getMonth() + 1;
            let date = datetime.getDate();
            let hour = datetime.getHours();
            let minute = datetime.getMinutes();
            let second = datetime.getSeconds();
    
            let padLeft = function (value, length) {
                return $String.padLeft(value, length, '0');
            };
    
    
            let isAM = hour <= 12;
    
            //这里不要用 {} 来映射，因为 for in 的顺序不确定
            let maps = [
                ['yyyy', padLeft(year, 4)],
                ['yy', String(year).slice(2)],
                ['MM', padLeft(month, 2)],
                ['M', month],
                ['dddd', '星期' + ('日一二三四五六'.charAt(datetime.getDay()))],
                ['dd', padLeft(date, 2)],
                ['d', date],
                ['HH', padLeft(hour, 2)],
                ['H', hour],
                ['hh', padLeft(isAM ? hour : hour - 12, 2)],
                ['h', isAM ? hour : hour - 12],
                ['mm', padLeft(minute, 2)],
                ['m', minute],
                ['ss', padLeft(second, 2)],
                ['s', second],
                ['tt', isAM ? 'AM' : 'PM'],
                ['t', isAM ? 'A' : 'P'],
                ['TT', isAM ? '上午' : '下午'],
                ['T', isAM ? '上' : '下']
            ];
    
    
            let s = formater;
    
            maps.forEach(function (item, index) {
                s = $String.replaceAll(s, item[0], item[1]);
            });
    
            return s;
        },
    
    
        /**
        * 将指定的毫秒数加到指定的 Date 上。
        * 此方法不更改参数 datetime 的值，而是返回一个新的 Date，其值是此运算的结果。
        * @param {Date} datetime 要进行操作的日期时间。
        * @param {Number} value 要增加/减少的毫秒数。 
            可以为正数，也可以为负数。
        * @param {string} [formater] 可选的，对结果进行格式化的字符串。 
        * @return {Date|string} 返回一个新的日期实例或字符串值。
            如果指定了参数 formater，则进行格式化，返回格式化后的字符串值；
            否则返回 Date 的实例对象。
        * @example
            $Date.addMilliseconds(new Date(), 2000); //给当前时间加上2000毫秒
        */
        add(datetime, value, formater) {
            datetime = exports.parse(datetime);
    
            let ms = datetime.getMilliseconds();
            let dt = new Date(datetime);//新建一个副本，避免修改参数
    
            dt.setMilliseconds(ms + value);
    
            if (formater) {
                dt = exports.format(dt, formater);
            }
    
            return dt;
        },
    
        /**
        * 将指定的秒数加到指定的 Date 实例上。
        * @param {Date} datetime 要进行操作的日期时间实例。
        * @param {Number} value 要增加/减少的秒数。可以为正数，也可以为负数。
        * @param {string} [formater] 可选的，对结果进行格式化的字符串。 
        * @return {Date} 返回一个新的日期实例。
            此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
        * @example
            $Date.addSeconds(new Date(), 90); //给当前时间加上90秒
        */
        addSeconds(datetime, value, formater) {
            return exports.add(datetime, value * 1000, formater);
        },
    
        /**
         * 将指定的分钟数加到指定的 Date 实例上。
         * @param {Date} datetime 要进行操作的日期时间实例。
         * @param {Number} value 要增加/减少的分钟数。可以为正数，也可以为负数。
         * @param {string} [formater] 可选的，对结果进行格式化的字符串。 
         * @return {Date} 返回一个新的日期实例。
            此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
         * @example
            $Date.addMinutes(new Date(), 90); //给当前时间加上90分钟
         */
        addMinutes(datetime, value, formater) {
            return exports.addSeconds(datetime, value * 60, formater);
        },
    
        /**
         * 将指定的小时数加到指定的 Date 实例上。
         * @param {Date} datetime 要进行操作的日期时间实例。
         * @param {Number} value 要增加/减少的小时数。可以为正数，也可以为负数。
         * @return {Date} 返回一个新的日期实例。
            此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
         * @example
            $Date.addHours(new Date(), 35); //给当前时间加上35小时
         */
        addHours(datetime, value, formater) {
            return exports.addMinutes(datetime, value * 60, formater);
        },
    
    
        /**
        * 将指定的天数加到指定的 Date 实例上。
        * @param {Date} datetime 要进行操作的日期时间实例。
        * @param {Number} value 要增加/减少的天数。可以为正数，也可以为负数。
        * @return {Date} 返回一个新的日期实例。。
            此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
        * @example
            $Date.addDays(new Date(), 35); //给当前时间加上35天
        */
        addDays(datetime, value, formater) {
            return exports.addHours(datetime, value * 24, formater);
        },
    
        /**
        * 将指定的周数加到指定的 Date 实例上。
        * @param {Date} datetime 要进行操作的日期时间实例。
        * @param {Number} value 要增加/减少的周数。可以为正数，也可以为负数。
        * @return {Date} 返回一个新的日期实例。
            此方法不更改参数 datetime 的值。 而是返回一个新的 Date，其值是此运算的结果。
        * @example
            $Date.addWeeks(new Date(), 3); //给当前时间加上3周
        */
        addWeeks(datetime, value, formater) {
            return exports.addDays(datetime, value * 7, formater);
        },
    
        /**
        * 将指定的月份数加到指定的 Date 实例上。
        * @param {Date} datetime 要进行操作的日期时间实例。
        * @param {Number} value 要增加/减少的月份数。可以为正数，也可以为负数。
        * @return {Date} 返回一个新的日期实例。
            此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
        * @example
            $Date.addMonths(new Date(), 15); //给当前时间加上15个月
        */
        addMonths(datetime, value, formater) {
            datetime = exports.parse(datetime);
    
            let dt = new Date(datetime);//新建一个副本，避免修改参数
            let old = datetime.getMonth();
    
            dt.setMonth(old + value);
    
            if (formater) {
                dt = exports.format(dt, formater);
            }
    
            return dt;
        },
    
        /**
        * 将指定的年份数加到指定的 Date 实例上。
        * @param {Date} datetime 要进行操作的日期时间实例。
        * @param {Number} value 要增加/减少的年份数。可以为正数，也可以为负数。
        * @return {Date} 返回一个新的日期实例。
            此方法不更改参数 datetime 的值。 而是返回一个新的 Date，其值是此运算的结果。
        * @example
            $Date.addYear(new Date(), 5); //假如当前时间是2013年，则返回的日期实例的年份为2018
        */
        addYears(datetime, value, formater) {
            return exports.addMonths(datetime, value * 12, formater);
        },
    
        /**
        * 设置一个参考时间在本地的初始值，随着时间的流逝，参考时间也会同步增长。
        * 如用来设置服务器时间在本地的初始值。
        * 
        */
        set(datetime) {
            let dt = exports.parse(datetime);
    
            if (!dt) {
                throw new Error('无法识别的日期时间格式: ' + datetime);
            }
    
            DELTA = dt - Date.now();
        },
    
        /**
        * 获取之前设置的参考时间。
        */
        get(formater) {
            let dt = new Date();
    
            if (DELTA != 0) {
                dt = exports.add(dt, DELTA);
            }
    
            if (formater) {
                dt = exports.format(dt, formater);
            }
    
            return dt;
        },
    };
});
/**
* src: @definejs/escape/modules/Escape.js
* pkg: @definejs/escape@1.0.0
*/
define('Escape', function (require, module, exports) { 
    
    /**
    * HTML 转码工具。
    */
    module.exports = exports = {
        /**
        * 把用户产生的内容做转换，以便可以安全地放在 html 里展示。
        * @return {String}
        */
        html(string) {
            var s = String(string);
            var reg = /[&'"<>\/\\\-\x00-\x09\x0b-\x0c\x1f\x80-\xff]/g;
    
            s = s.replace(reg, function (r) {
                return "&#" + r.charCodeAt(0) + ";"
            });
    
            s = s.replace(/ /g, "&nbsp;");
            s = s.replace(/\r\n/g, "<br />");
            s = s.replace(/\n/g, "<br />");
            s = s.replace(/\r/g, "<br />");
    
            return s;
        },
    
        /**
        * 把用户产生的内容做转换，以便可以安全地放在节点的属性里展示。
        * @example 如 `<input value="XXX">`，`XXX` 就是要转换的部分。
        * @return {String}
        */
        attribute(string) {
            var s = String(string);
            var reg = /[&'"<>\/\\\-\x00-\x1f\x80-\xff]/g;
    
            return s.replace(reg, function (r) {
                return "&#" + r.charCodeAt(0) + ";"
            });
        },
    
        /**
        * 用做过滤直接放到 HTML 里 j s中的。
        * @return {String}
        */
        script(string) {
            var s = String(string);
            var reg = /[\\"']/g;
    
            s = s.replace(reg, function (r) {
                return "\\" + r;
            });
    
            s = s.replace(/%/g, "\\x25");
            s = s.replace(/\n/g, "\\n");
            s = s.replace(/\r/g, "\\r");
            s = s.replace(/\x01/g, "\\x01");
    
            return s;
        },
    
        /**
        * 对查询字符串中的值部分进行转换。
        * 如 `http://www.test.com/?a=XXX`，其中 `XXX` 就是要过滤的部分。
        * @return {String}
        */
        query(string) {
            var s = String(string);
            return escape(s).replace(/\+/g, "%2B");
        },
    
        /**
        * 用做过滤直接放到<a href="javascript:alert('XXX')">中的XXX
        * @return {String}
        */
        hrefScript(string) {
            var s = exports.escapeScript(string);
    
            s = s.replace(/%/g, "%25"); //escMiniUrl
            s = exports.escapeElementAttribute(s);
            return s;
    
        },
    
        /**
        * 用做过滤直接放到正则表达式中的。
        * @return {String}
        */
        regexp(string) {
            var s = String(string);
            var reg = /[\\\^\$\*\+\?\{\}\.\(\)\[\]]/g;
    
            return s.replace(reg, function (a, b) {
                return "\\" + a;
            });
        },
    };
});
/**
* src: @definejs/fn/modules/Fn.js
* pkg: @definejs/fn@1.0.0
*/
define('Fn', function (require, module, exports) { 
    const $Math = require('Math');
    
    
    /**
    * 函数工具。
    */
    module.exports = {
        /**
        * 空函数。
        * 提供一个什么也不做、直接原样返回入参的空操作函数。
        * 在很多场合可以用来提供给模块配置，以要求的回调函数不为空。
        */
        noop(...args) {
            return args[0];
        },
    
        /**
        * 用一个的随机延迟时间去执行一个回调函数，并传递一些参数。
        * @param {Object} delay 延迟配置对象。
            如 { min: 500, max: 2000, }，当不需要延迟时，则应为 null。
        * @param {function} fn 要延迟执行的函数。
        * @param {Array} [args] 要传递的参数数组。
        * @return {number} 返回 setTimeout 的结果。
        *   如果没有启用延迟，则不返回值。
        */
        delay(delay, fn, args) {
            if (!fn) {
                return;
            }
    
            if (delay === false || delay == null) { //不启用延迟
                fn.apply(null, args);
                return;
            }
    
            let timeout =
                typeof delay == 'number' ? delay :
                $Math.randomInt(delay.min, delay.max);
    
            return setTimeout(function () {
                fn.apply(null, args);
    
            }, timeout);
        },
    
        /**
         * 构造一个函数闭包来执行指定的代码字符串。
         * @param {string} content 要执行的代码字符串。
         * @returns {*} 返回代码字符串里所返回的值。
         */
        exec(content) {
            let js = `
                return (function () { 
                    ${content}
                })();
            `;
    
            let fn = new Function(js);
    
            return fn();
        },
    };
});
/**
* src: @definejs/math/modules/Math.js
* pkg: @definejs/math@1.0.0
*/
define('Math', function (require, module, exports) { 
    
    module.exports = exports = {
        /**
        * 产生指定闭区间的随机整数。
        * @param {Number} [minValue=0] 闭区间的左端值。
        *   当只指定一个参数时，minValue 默认为 0；
        * @param {Number} [maxValue] 闭区间的右端值。
        * @return 返回一个整数。
        *   当不指定任何参数时，则用 Math.random() 产生一个已移除了小数点的随机整数。
        * @example
        *   $Math.randomInt(100, 200); //产生一个区间为 [100, 200] 的随机整数。
        *   $Math.randomInt(100); //产生一个区间为 [0, 200] 的随机整数。
        *   $Math.randomInt(); //产生一个随机整数。
        */
        randomInt(minValue, maxValue) {
            let len = arguments.length;
    
            //重载 Math.randomInt()
            if (len == 0) { 
                //先称除小数点，再去掉所有前导的 0，最后转为 number
                return Number(String(Math.random()).replace('.', '').replace(/^0*/g, ''));
            }
    
            //重载 Math.randomInt(maxValue)
            if (len == 1) { 
                maxValue = minValue;
                minValue = 0;
            }
    
            let count = maxValue - minValue + 1;
            return Math.floor(Math.random() * count + minValue);
        },
    
        /**
        * 圆形求模方法。
        * 即用圆形链表的方式滑动一个数，返回一个新的数。
        * 即可正可负的双方向求模。
        * 可指定圆形链表的长度(size) 和滑动的步长(step)，滑动步长的正负号指示了滑动方向
        */
        slide(index, size, step) {
            step = step || 1; //步长默认为1
    
            index += step;
    
            if (index >= 0) {
                return index % size;
            }
    
            return (size - (Math.abs(index) % size)) % size;
        },
    
        /**
        * 下一个求模数。
        */
        next(index, size) {
            return exports.slide(index, size, 1);
        },
    
        /**
        * 上一个求模数。
        */
        previous(index, size) {
            return exports.slide(index, size, -1);
        },
    
    
        /**
        * 把一个含有百分号S的字符串解析成等值的小数。
        * @param {String} v 要解析的参数。
        *   期望得到 String 类型，实际可传任何类型。
        * @return {Number} 返回一个小数。
        *   只有参数是字符串，并且去掉前后空格后以百分号结尾才会进行转换；否则直接返回参数。
        *   如果解析失败，则返回 NaN。
        */
        parsePercent(v) {
            if (typeof v != 'string') {
                return v;
            }
    
            let s = v.trim();
    
            if (s.slide(-1) != '%') {
                return v;
            }
    
            return parseFloat(s) / 100;
    
        },
    };
});
/**
* src: @definejs/hash/modules/Hash.js
* pkg: @definejs/hash@1.0.0
*/
define('Hash', function (require, module, exports) { 
    const $Object = require('Object');
    const Query = require('Query');
    
    /**
    * Url 中的哈希工具。
    */
    module.exports = exports = {
        /**
        * 获取指定 url 的 hash 中指定的键所对应的值。
        * @param {string} url 要进行获取的 url 字符串。
        * @param {string} [key] 要检索的键。
        * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写。 默认区分大小写。
            如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
            当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
        * @retun {string|Object|undefined} 返回一个查询字符串值。
            当不指定参数 key 时，则获取全部 hash 值，对其进行 unescape 解码，
            然后返回一个等价的 Object 对象。
            当指定参数 key 为一个空字符串，则获取全部 hash (不解码)，返回一个 string 类型值。
        * @example
            Hash.get('http://test.com?query#a%3D1%26b%3D2', 'a');  //返回 '1'
            Hash.get('http://test.com?query#a%3D1%26b%3D2', 'c');  //返回 undefined
            Hash.get('http://test.com?query#a%3D1%26A%3D2', 'A');  //返回 2
            Hash.get('http://test.com?query#a%3D1%26b%3D2', 'A', true);//返回 1
            Hash.get('http://test.com?query#a%3D1%26b%3D2', '');   //返回 'a%3D1%26b%3D2'
            Hash.get('http://test.com?query#a%3D1%26b%3D2');       //返回 {a: '1', b: '2'}
            Hash.get('http://test.com?query#a%3D%26b%3D');         //返回 {a: '', b: ''}
            Hash.get('http://test.com??query#a%26b');              //返回 {a: '', b: ''}
            Hash.get('http://test.com?query#a', 'a');              //返回 ''
        */
        get(url, key, ignoreCase) {
            //重载 get(location, key, ignoreCase)
            //重载 get(window, key, ignoreCase)
            if (typeof url == 'object') {
                let location = null;
    
                if ('href' in url) {            //url is `location`。
                    location = url;
                }
                else if ('location' in url) {    //url is `window`。
                    location = url.location;
                }
                else {
                    throw new Error(`当参数 url 是一个 Object 类型时，只能是浏览器环境中的 location 或 window 对象。`);
                }
    
                url = location.href;
            }
    
            let beginIndex = url.indexOf('#');
            if (beginIndex < 0) { //不存在查询字符串
                return;
            }
    
            let endIndex = url.length;
            let hash = url.slice(beginIndex + 1, endIndex);
            
            hash = unescape(hash); //解码
    
            if (key === '') { //获取全部 hash 的 string 类型
                return hash;
            }
    
    
            let obj = Query.parse(hash);
    
            if (key === undefined) { //未指定键，获取整个 Object 对象
                return obj;
            }
    
            if (!ignoreCase || key in obj) { //区分大小写或有完全匹配的键
                return obj[key];
            }
    
    
            //以下是不区分大小写
            key = key.toString().toLowerCase();
    
            for (let name in obj) {
                if (name.toLowerCase() == key) {
                    return obj[name];
                }
            }
        },
    
        /**
        * 把指定的 hash 设置到指定的 url 上。
        * 该方法会对 hash 进行 escape 编码，再设置到 url 上，以避免 hash 破坏原有的 url。
        * 同时原有的 hash 会移除掉而替换成新的。
        * @param {string} url 要设置的 url 字符串。
        * @param {string|number|boolean|Object} key 要设置的 hash 的键。
            当传入一个 Object 对象时，会对键值对进行递归编码成查询字符串， 然后用 escape 编码来设置 hash 。
            当传入的是一个 string|number|boolean 类型，并且不传入第三个参数， 则直接用 escape 编码来设置 hash 。
        * @param {string} [value] 要添加的 hash 的值。
        * @retun {string} 返回组装后的新的 url 字符串。
        * @example
            //返回 'http://test.com?#a%3D1'
            Hash.set('http://test.com', 'a', 1);  
            
            //返回 'http://test.com?query#a%3D3%26d%3D4'
            Hash.set('http://test.com?query#a%3D1%26b%3D2', {a: 3, d: 4});  
     
            //返回 'http://test.com?query#a%3D3%26d%3D4'
            Hash.set('http://test.com?query#a%3D1%26b%3D2', 'a=3&b=4'); 
            
        */
        set(url, key, value) {
            let location = null;
    
            if (typeof url == 'object') {
                if ('href' in url) {            //url is `location`。
                    location = url;         
                }
                else if ('location' in url) {    //url is `window`。
                    location = url.location; 
                }
                else {
                    throw new Error(`当参数 url 是一个 Object 类型时，只能是浏览器环境中的 location 或 window 对象。`);
                }
    
                url = location.href;
            }
    
            let type = typeof key;
            let isValueType = (/^(string|number|boolean)$/).test(type);
            let hash = '';
    
            if (arguments.length == 2 && isValueType) {
                hash = String(key);
            }
            else {
                let obj = type == 'object' ? key : $Object.make(key, value);
                hash = Query.stringify(obj);
            }
    
    
            hash = escape(hash); //要进行编码，避免破坏原有的 url
    
            let index = url.lastIndexOf('#');
            if (index > -1) {
                url = url.slice(0, index);
            }
    
            url = url + '#' + hash;
    
            //在浏览器环境，立即应用。
            if (location) {
                location.hash = hash; //不要设置整个 location.href，否则会刷新
            }
    
    
            return url;
    
        },
    
        /**
        * 判断指定的 url 是否包含特定名称的 hash。
        * @param {string} url 要检查的 url。
        * @param {string} [key] 要提取的查询字符串的键。
        * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写，默认区分大小写。
            如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
            当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
        * @retun {boolean} 如果 url 中包含该名称的查询字符串，则返回 true；否则返回 false。
        * @example
            Hash.has('http://test.com?a=1&b=2#hash', 'a');  //返回 true
            Hash.has('http://test.com?a=1&b=2#hash', 'b');  //返回 true
            Hash.has('http://test.com?a=1&b=2#hash', 'c');  //返回 false
            Hash.has('http://test.com?a=1&b=2#hash', 'A', true); //返回 true
            Hash.has('http://test.com?a=1&b=2#hash');       //返回 true
        */
        has(url, key, ignoreCase) {
            //重载 has(location, key, ignoreCase)
            //重载 has(window, key, ignoreCase)
            if (typeof url == 'object') {
                let location = null;
    
                if ('href' in url) {            //url is `location`。
                    location = url;
                }
                else if ('location' in url) {    //url is `window`。
                    location = url.location;
                }
                else {
                    throw new Error(`当参数 url 是一个 Object 类型时，只能是浏览器环境中的 location 或 window 对象。`);
                }
    
                url = location.href;
            }
    
            let obj = exports.get(url); //获取全部 hash 字符串的 Object 形式。
    
            if (!obj) {
                return false;
            }
    
    
            if (!key) { //不指定名称，
                return !$Object.isEmpty(obj); //只要有数据，就为 true
            }
    
            if (key in obj) { //找到完全匹配的
                return true;
            }
    
    
            if (ignoreCase) { //明确指定了忽略大小写
                key = key.toString().toLowerCase();
    
                for (let name in obj) {
                    if (name.toLowerCase() == key) {
                        return true;
                    }
                }
            }
    
            //区分大小写，但没找到。
            return false;
    
        },
    
        /**
        * 监听指定窗口 url 的 hash 变化，并触发一个回调函数。
        * 已重载　onchange(window, fn);
        * 已重载　onchange(window, immediate, fn);
        * @param {Window} window 要监听的 window 窗口。
        * @param {boolean} [immediate=false] 指示初始时是否要立即执行回调函数。
            初始时如果要立即执行回调函数，请指定该参数为 true；
            否则不指定或指定为 false。
        * @param {function} fn 当监听窗口的 hash 发生变化时，要触发的回调函数。
        *   该回调函数会接收到两个参数：hash 和 old，当前的 hash 值和旧的 hash 值。
        *   注意，hash 和 old 都去掉了 '#' 号而直接保留 hash 值。
        *   如果 old 不存在，则为 null。
        *   该回调函数内部的 this 指向监听的窗口。
        * @example
            Hash.onchange(top, function (hash, old) {
                console.log('new hash: ' + hash);
                console.log('old hash: ' + old);
                console.log(this === top); //true
            });
        */
        onchange(window, immediate, fn) {
            //重载 onchange(window, fn);
            if (typeof immediate == 'function') {
                fn = immediate;
                immediate = false;
            }
    
    
            let hash = exports.get(window, '');
    
            //指定了要立即触发，则立即触发。
            if (immediate) {
                fn.call(window, hash, null, immediate);
            }
    
    
            window.addEventListener('hashchange', function () {
                let old = hash;
    
                hash = exports.get(window, '');
                fn && fn(hash, old, false);
            });
    
        },
    
    };
});
/**
* src: @definejs/query/modules/Query.js
* pkg: @definejs/query@1.0.0
*/
define('Query', function (require, module, exports) { 
    const $Object = require('Object');
    const $String = require('String');
    
    //把指定的 url 中的查询字符串替换成目标查询字符串。 
    //同时会保留原有的 hash 串。
    function replace(url, qs) {
        qs = qs || '';
    
        if (typeof qs == 'object') {
            qs = exports.stringify(qs);
        }
    
        if (qs) {
            qs = '?' + qs;
        }
    
        var hasQuery = url.includes('?');
        var hasHash = url.includes('#');
        var parts = [];
    
    
        if (hasQuery && hasHash) {
            parts = url.split(/\?|#/g);
            return parts[0] + qs + '#' + parts[2];
        }
    
        if (hasQuery) {
            parts = url.split('?');
            return parts[0] + qs;
        }
    
        if (hasHash) {
            parts = url.split('#');
            return parts[0] + qs + '#' + parts[1];
        }
    
    
        return url + qs;
    }
    
    
    /**
    * Url 中的查询字符串工具。
    */
    module.exports = exports = {
        /**
        * 把 url 中的查询字符串解析为等价结构的 Object 对象。
        * @param {string} url 要进行解析的查询字符串。
        * @param {boolean} [isShallow=false] 指示是否使用浅层次进行解析。
            当显式指定 isShallow 参数为 true 时，则使用浅层次来解析(只解析一层，不进行递归解析)；
            否则(默认)使用深层次解析。
        * @param {boolean} [isCompatible=false] 指示是否使用兼容模式进行解码。
            当指定 isCompatible 参数为 true 时，将使用 unescape 来编码；
            否则(默认)使用 decodeURIComponent。
        * @return {Object} 返回一个包含键值对的 Object 对象。
            当参数 url 非法时，返回空对象 {}。
        * @example
            var url = 'a=1&b=2&c=A%3D100%26B%3D200';
            var obj = Query.parse(url);
            得到 obj = {a: 1, b:2, c: {A: 100, B: 200}};
        */
        parse(url, isShallow, isCompatible) {
            if (!url || typeof url != 'string') {
                return {}; //这里不要返回 null，免得外部调用出错。
            }
    
            var decode = isCompatible ? unescape : decodeURIComponent;  //解码方法，默认用后者。
            var isDeep = !isShallow;        //深层次解析，为了语义上更好理解，换个名称。
            const toValue = $String.toValue;  //缓存一下方法，以提高循环中的性能。
            var obj = {};
    
            url.split('&').map(function (item) {
                var pair = item.split('=');
                var name = decode(pair[0]);
                var value = pair[1];
    
                if (pair.length > 1) {
                    value = decode(value);
    
                    //深层次解析
                    if (isDeep && value.indexOf('=') > 0) { //还出现=号，说明还需要进一层次解码
                        value = exports.parse(value); //递归调用
                    }
                    else { //处理一下字符串类型的 0|1|true|false|null|undefined|NaN
                        value = toValue(value); //还原常用的数据类型
                    }
                }
    
                var existed = name in obj;
    
                if (!existed) {
                    obj[name] = value;
                    return;
                }
    
    
                //支持重复名称，如果有则放到一个数组里。
                var old = obj[name];
    
                if (Array.isArray(old)) {
                    old.push(value);
                }
                else {
                    obj[name] = [old, value];
                }
    
            });
    
            return obj;
        },
    
        /**
        * 把一个对象编码成等价结构的 url 查询字符串。
        * @param {Object} obj 要进行编码的对象
        * @param {boolean} [isCompatible=false] 
            指定是否要使用兼容模式进行编码。
            当需要使用 escape 进行编码时，请指定 true；
            否则要使用 encodeURIComponent 进行编码，请指定 false 或不指定。
        * @return {string} 返回一个经过编码的 url 查询字符串
        * @example
            var obj = {
                a: 1,
                b: 2,
                c: { A: 100, B: 200 },
                d: null,
                e: undefined,
                f: ['a', 'b', 'c']
            };
            var s = Query.stringify(obj);
            console.log(s); 
            //结果 a=1&b=2&c=A%3D100%26B%3D200&d=null&e=undefined&f=%5Ba%2C%20b%5D
        */
        stringify(obj, isCompatible) {
            if (obj == null) {     // null 或 undefined
                return String(obj);
            }
    
            switch (typeof obj) {
                case 'string':
                case 'number':
                case 'boolean':
                    return obj;
            }
    
            if (obj instanceof String ||
                obj instanceof Number ||
                obj instanceof Boolean ||
                obj instanceof Date) {
                return obj.valueOf();
            }
    
            if (Array.isArray(obj)) {
                return '[' + obj.join(', ') + ']';
            }
    
            let encode = isCompatible ? escape : encodeURIComponent;
            let pairs = [];
    
    
            $Object.each(obj, function (key, value) {
                key = encode(key);
    
                if (value === undefined) {
                    pairs.push(key);
                    return;
                }
    
                value = exports.stringify(value);
                value = encode(value);
    
                pairs.push(`${key}=${value}`);
    
            });
    
            return pairs.join('&');
    
        },
    
        /**
        * 获取指定 url 的查询字符串中指定的键所对应的值。
        * 已重载 get(url, key, ignoreCase);
        * 已重载 get(location, key, ignoreCase);
        * 已重载 get(window, key, ignoreCase);
        * @param {string} url 要进行获取的 url 字符串。
        * @param {string} [key] 要检索的键。
        * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写。 默认区分大小写。
            如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
            当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
        * @retun {string|Object|undefined} 返回一个查询字符串值。
            当不指定参数 key 时，则获取全部查询字符串，返回一个等价的 Object 对象。
            当指定参数 key 为一个空字符串，则获取全部查询字符串，返回一个 string 类型值。
        * @example
            Query.get('http://test.com?a=1&b=2#hash', 'a');  //返回 '1'
            Query.get('http://test.com?a=1&b=2#hash', 'c');  //返回 undefined
            Query.get('http://test.com?a=1&A=2#hash', 'A');  //返回 2
            Query.get('http://test.com?a=1&b=2#hash', 'A', true);//返回 1
            Query.get('http://test.com?a=1&b=2#hash', '');   //返回 'a=1&b=2'
            Query.get('http://test.com?a=1&b=2#hash');       //返回 {a: '1', b: '2'}
            Query.get('http://test.com?a=&b=');              //返回 {a: '', b: ''}
            Query.get('http://test.com?a&b');                //返回 {a: '', b: ''}
            Query.get('http://test.com?a', 'a');             //返回 ''
        */
        get(url, key, ignoreCase) {
            //重载 get(location, key, ignoreCase)
            //重载 get(window, key, ignoreCase)
            if (typeof url == 'object') {
                url = ('href' in url) ? url.href :  //location
                    url.location.href;              //window
            }
    
            let beginIndex = url.indexOf('?');
            if (beginIndex < 0) { //不存在查询字符串
                return;
            }
    
            let endIndex = url.indexOf('#');
            if (endIndex < 0) {
                endIndex = url.length;
            }
    
            let qs = url.slice(beginIndex + 1, endIndex);
            if (key === '') { //获取全部查询字符串的 string 类型。
                return decodeURIComponent(qs);
            }
    
    
            let obj = exports.parse(qs);
    
            if (key === undefined) { //未指定键，获取整个 Object 对象。
                return obj;
            }
    
            if (!ignoreCase || key in obj) { //区分大小写或有完全匹配的键。
                return obj[key];
            }
    
            //以下是不区分大小写
            key = key.toString().toLowerCase();
    
            for (let name in obj) {
                if (name.toLowerCase() == key) {
                    return obj[name];
                }
            }
    
        },
    
        /**
        * 给指定的 url 添加一个查询字符串。
        * 注意，该方法会保留之前的查询字符串，并且覆盖同名的查询字符串。
        * @param {string} url 组装前的 url。
        * @param {string|Object} key 要添加的查询字符串的键。
        *   当传入一个 Object 对象时，会对键值对进行递归组合编码成查询字符串。
        * @param {string} [value] 要添加的查询字符串的值。
        * @retun {string} 返回组装后的新的 url。
        * @example
            //返回 'http://test.com?a=1&b=2&c=3#hash'
            Query.add('http://test.com?a=1&b=2#hash', 'c', 3);  
            
            //返回 'http://test.com?a=3&b=2&d=4#hash'
            Query.add('http://test.com?a=1&b=2#hash', {a: 3, d: 4});  
        */
        add(url, key, value) {
            var qs = exports.get(url) || {}; //先取出原来的。
    
            if (typeof key == 'object') {
                Object.assign(qs, key);
            }
            else {
                qs[key] = value;
            }
    
    
            //过滤掉值为 null 的项
            var obj = {};
    
            for (let key in qs) {
                let value = qs[key];
    
                if (value === null) {
                    continue;
                }
                else {
                    obj[key] = value;
                }
    
            }
    
            return exports.set(url, obj);
    
        },
    
    
        /**
        * 删除指定的 url 的查询字符串。
        * 已重载 remove(url);          //删除全部查询字符串。
        * 已重载 remove(url, key);     //删除指定键的查询字符串。
        * 已重载 remove(window);       //删除指定 window 窗口的全部查询字符串，会导致页面刷新。
        * 已重载 remove(window, key);  //删除指定 window 窗口的指定键查询字符串，会导致页面刷新。
        * 已重载 remove(location);     //删除指定 location 窗口的全部查询字符串，会导致页面刷新。
        * 已重载 remove(location, key);//删除指定 location 窗口的指定键查询字符串，会导致页面刷新。
        */
        remove(url, key) {
            let location = null;
    
            if (typeof url == 'object') {
                if ('href' in url) {
                    location = url;         //location
                }
                else {
                    location = url.location; //window
                }
    
                url = location.href;
            }
    
            let qs = '';
    
            if (key) {
                qs = exports.get(url);
                delete qs[key];
            }
    
            url = replace(url, qs);
    
            //设置整个 location.href 会刷新
            if (location) {
                location.href = url;
            }
    
            return url;
    
        },
    
    
        /**
        * 给指定的 url 添加一个随机查询字符串。
        * 注意，该方法会保留之前的查询字符串，并且添加一个键名为随机字符串而值为空字符串的查询字符串。
        * @param {string} url 组装前的 url。
        * @param {number} [len] 随机键的长度。
        * @retun {string} 返回组装后的新的 url。
        * @example
            //返回值类似 'http://test.com?a=1&b=2&7A8CEBAFC6B4=#hash'
            Query.random('http://test.com?a=1&b=2#hash');  
            
            //返回值类似 'http://test.com?a=1&b=2&7A8CE=#hash' 
            Query.random('http://test.com?a=1&b=2#hash', 5); //随机键的长度为 5
     
        */
        random(url, len) {
            var key = $String.random(len);
            return exports.add(url, key, undefined);
        },
    
    
    
        /**
        * 把指定的 url 和查询字符串组装成一个新的 url。
        * 注意，该方法会删除之前的查询字符串。
        * @param {string} url 组装前的 url。
        * @param {string|Object} key 要设置的查询字符串的键。
            当传入一个 Object 对象时，会对键值对进行递归组合编码成查询字符串。
        * @param {string} [value] 要添加的查询字符串的值。
        * @retun {string} 返回组装后的新的 url。
        * @example
            //返回 'http://test.com?c=3#hash'
            Query.set('http://test.com?a=1&b=2#hash', 'c', 3);  
            
            //返回 'http://test.com?a=3&d=4#hash'
            Query.set('http://test.com?a=1&b=2#hash', {a: 3, d: 4});  
        */
        set(url, key, value) {
            var location = null;
    
            if (typeof url == 'object') {
                if ('href' in url) {
                    location = url;         //location
                }
                else {
                    location = url.location; //window
                }
    
                url = location.href;
            }
    
    
            var qs = '';
            var type = typeof key;
            var isValueType = (/^(string|number|boolean)$/).test(type);
    
            //set(url, qs);
            if (arguments.length == 2 && isValueType) {
                qs = encodeURIComponent(key);
            }
            else {
                qs = type == 'object' ? key : { [key]: value, };
            }
    
    
            url = replace(url, qs);
    
    
            //设置整个 location.href 会刷新
            if (location) {
                location.href = url;
            }
    
            return url;
    
    
        },
    
        /**
        * 判断指定的 url 是否包含特定名称的查询字符串。
        * @param {string} url 要检查的 url。
        * @param {string} [key] 要提取的查询字符串的键。
        * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写，默认区分大小写。
            如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
            当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
        * @retun {boolean} 如果 url 中包含该名称的查询字符串，则返回 true；否则返回 false。
        * @example
            Query.has('http://test.com?a=1&b=2#hash', 'a');  //返回 true
            Query.has('http://test.com?a=1&b=2#hash', 'b');  //返回 true
            Query.has('http://test.com?a=1&b=2#hash', 'c');  //返回 false
            Query.has('http://test.com?a=1&b=2#hash', 'A', true); //返回 true
            Query.has('http://test.com?a=1&b=2#hash');       //返回 true
        */
        has(url, key, ignoreCase) {
            //重载 has(location, key, ignoreCase)
            //重载 has(window, key, ignoreCase)
            if (typeof url == 'object') {
                url = ('href' in url) ? url.href :  //location
                    url.location.href;              //window
            }
    
            var obj = exports.get(url); //获取全部查询字符串的 Object 形式
    
            if (!obj) {
                return false;
            }
    
            if (!key) { //不指定名称，
                return !$Object.isEmpty(obj); //只要有数据，就为 true
            }
    
            if (key in obj) { //找到完全匹配的
                return true;
            }
    
            if (ignoreCase) { //明确指定了忽略大小写
                key = key.toString().toLowerCase();
    
                for (let name in obj) {
                    if (name.toLowerCase() == key) {
                        return true;
                    }
                }
            }
    
            //区分大小写，但没找到
            return false;
    
        },
    
        /**
        * 对查询字符串中的值部分进行转换过滤。
        * 如 `http://www.test.com/?a=XXX`，其中 `XXX` 就是要过滤的部分。
        * @return {String}
        */
        escape(string) {
            var s = String(string);
            return escape(s).replace(/\+/g, "%2B");
        },
    
    };
});
/**
* src: @definejs/json/modules/JSON.js
* pkg: @definejs/json@1.0.0
*/
define('JSON', function (require, module, exports) { 
    
    module.exports = {
        /**
        * 把一个 JSON 字符串数据解析成对象。
        * @param {String} content 要解析的内容。
        */
        parse(content) {
            try {
                let obj = JSON.parse(content);
                return obj;
            }
            catch (ex) {
                // console.warn('使用原生的 JSON.parse() 方法无法解析:', content);
                console.warn('使用原生的 JSON.parse() 方法无法解析。');
            }
    
    
            try {
                //这种方法是 jQuery 的实现，有问题。
                //content = content.replace(/^(\r\n)+/g, ' ');
                //return (new Function('return ' + content))();
    
                //下面这方法安全、可靠些。
                //包装多一层匿名立即执行函数。
                let js = [
                    'return (function () { ',
                    '   var obj = ' + content + ';', //因为 return 的换行问题，这里用一个 obj 变量再返回 obj 会安全很多。
                    '   return obj;',
                    '})();',
    
                ].join('\r\n');
    
                let fn = new Function(js);
                let obj = fn();
    
                return obj;
            }
            catch (ex) {
                console.warn('使用 new Function() 方法无法解析。');
            }
    
            return null;
    
        },
    
        /**
        * 把一个对象解析成 JSON 字符串。
        */
        stringify(...args) {
            return JSON.stringify(...args);
        },
    };
});
/**
* src: @definejs/style/modules/Style.js
* pkg: @definejs/style@1.0.0
*/
define('Style', function (require, module, exports) { 
    
    
    const $Object = require('Object');
    
    //像素化。
    function pixelize(value) {
        if (typeof value == 'number') {
            return value + 'px';
        }
    
        if (typeof value == 'string') {
            let isPixel = (/^\d+px$/g).test(value);
            let isEm = (/^\d+em$/g).test(value);
            let isRem = (/^\d+rem$/g).test(value);
            let isPercent = (/^\d+%$/g).test(value);
    
            if (isPixel || isEm || isRem || isPercent) {
                return value;
            }
    
            //尝试提取和转换数字部分。
            let v = parseInt(value);
    
            if (isNaN(v)) {
                return value;
            }
    
            return v + 'px';
        }
    
        //其它情况。
        return value;
    }
    
    
    /**
    * 样式工具。
    * @name Style
    */
    module.exports = exports = {
        /**
        * 把一个样式字符串对象化。
        */
        objectify(style) {
            if (!style) {
                return {};
            }
    
            if (typeof style == 'object') {
                return style;
            }
    
            if (typeof style != 'string') {
                return {};
            }
    
            let obj = {};
            let list = style.split(';');
    
            list.forEach(function (item) {
                item = item.trim();
                item = item.replace(/\n/g, '');
    
                if (!item) {
                    return;
                }
    
                let a = item.split(':');
                let key = a[0].trim();
                let value = a[1].trim();
    
                obj[key] = value;
    
            });
    
            return obj;
    
        },
    
        /**
        * 把一个样式对象字符串化。
        * 以用于 DOM 节点的 style 属性中或 style 标签中。
        * 已重载 stringify(style, spaces);             //
        * 已重载 stringify(style, replacer, spaces);   //style 为一个对象或字符串，replacer 为一个函数，spaces 为一个数值;  
        * 参数：
        *   style: '',      //样式对象或字符串。
        *   replace: fn,    //处理器函数，即替换函数。 如果指定，则针对每一项调用它以获得返回值。 如果不返回任何值，则扔掉该项。
        *   spaces: 4,      //要生成的前导空格数。 如果指定非 0 值，则生成多行的形式；否则生成行内形式。
        */
        stringify(style, replacer, spaces) {
            if (!style) {
                return '';
            }
    
            if (typeof style == 'string') {
                style = exports.objectify(style);
            }
    
    
            //重载 stringify(style, spaces);
            if (typeof replacer == 'number') {
                spaces = replacer;
                replacer = null;
            }
    
    
            let a = [];
    
            $Object.each(style, function (key, value) {
    
                //如果指定了处理器函数函数，则调用它以获得返回值。
                value = replacer ? replacer(key, value) : value;
    
                //扔掉空值: null、undefined、''。
                if (value == null || value === '') {
                    return; // continue;
                }
    
                let s = key + ': ' + value; //如 `width: 100px`
    
                if (spaces) {
                    s = new Array(spaces + 1).join(' ') + s; //产生前导空格，如 `    width: 100px`
                }
    
                a.push(s);
    
            });
    
            if (a.length == 0) {
                return '';
            }
    
            style = spaces ?
                a.join('; \n') + '; \n' :   //如果指定了前导空格，则生成多行形式的。
                a.join('; ') + '; ';        //否则生成行内形式的。
    
            return style;
        },
    
        /**
        * 把一个样式对象像素化。
        */
        pixelize(style, keys) {
            //重载 pixelize(value);
            //直接传一个值进来，根据情况转换成带像素单位的形式。
            //如 pixelize(100); 得到 `100px`。
            if (typeof style != 'object' && !keys) {
                return pixelize(style);
            }
    
            keys = keys || [];
            style = exports.objectify(style);
    
            style = $Object.map(style, function (key, value) {
                //该项并非要处理的项。
                if (!keys.includes(key)) {
                    return value;
                }
    
                return pixelize(value);
            });
    
            return style;
        },
    
        /**
        * 去掉空值。
        * 即去掉值为 null、undefined、'' 的项。
        */
        trim(style) {
            let obj = {};
    
            //过滤掉空值。
            $Object.each(style, function (key, value) {
                if (value == null || value === '') {
                    return;
                }
    
                obj[key] = value;
            });
    
            return obj;
        },
    
        /**
        * 对每一项进行空值过滤，再进行合并得到一个样式对象。
        */
        merge(...items) {
    
            //对一个 item 进行处理
            items = items.map(function (item) {
                if (!item) {
                    return {};
                }
    
                item = exports.trim(item);
                return item;
    
            });
    
    
            let obj = Object.assign(...items);
    
            return obj;
    
        },
    
    
    
    };
    
    
});
/**
* src: @definejs/tasker/modules/Tasker.js
* pkg: @definejs/tasker@1.0.0
*/
define('Tasker', function (require, module, exports) { 
    const Emitter = require('Emitter');
    
    const mapper = new Map();
    const sid$todos = {};
    
    
    class Tasker {
        /**
        * 构造器。
        * @param {Array} [list] 任务列表。
        */
        constructor(list) {
            let meta = {
                'emitter': new Emitter(this),
                'list': list || [],
            };
    
            mapper.set(this, meta);
        }
    
    
        /**
        * 并行处理。
        * @param {Array} [list] 要处理的任务列表。 
        *   如果不指定，则使用构造器中的。
        */
        parallel(list) {
            let meta = mapper.get(this);
            list = list || meta.list;
    
            //空的任务列表。
            if (!list.length) {
                meta.emitter.fire('all', [[]]); //里面要套个空数组。
                return;
            }
    
            //非空的任务列表。
            let total = list.length;        //总项数。
            let count = total;              //待处理的项数。
            let values = new Array(total);  //收集每项异步操作的返回值。
            let dones = new Array(total);   //[true, undefined, true, ..., ] 记录对应的项是否已完成。
    
            list.forEach(function (item, index) {
                //done(index) 是异步调用，要多一层闭包。
                (function (index) {
                    //第三个参数是一个回调函数，即 done(value); 
                    //由业务层调用，以通知异步操作完成。
                    //done(value); 接受一个参数作为此项异步操作的返回值进行收集，
                    //最后会在全部完成后一起传过去给业务层。
                    meta.emitter.fire('each', [item, index, function (value) {
                        values[index] = value; //需要收集的值，由调用者传入。
                        dones[index] = true;
                        count--;
    
                        //计数为 0 时，不一定就全部完成了，
                        //因为调用者可能会恶意多次调用 done() 以使计数减少到 0。
                        //但有一点可以肯定的：只要计数不为 0，说明至少有一项未完成。
                        if (count > 0) { //性能优化
                            return;
                        }
    
                        //安全起见，检查每项的完成状态。
                        for (let i = 0; i < total; i++) {
                            if (!dones[i]) {
                                return;
                            }
                        }
    
                        //至此，全部项都已完成。
                        meta.emitter.fire('all', [values]);
                    }]);
    
                })(index);
    
            });
        }
    
        /**
        * 串行处理。
        * @param {Array} [list] 要处理的任务列表。 
        *   如果不指定，则使用构造器中的。
        */
        serial(list) {
            let meta = mapper.get(this);
            list = list || meta.list;
    
    
            //空的任务列表。
            if (!list.length) {
                meta.emitter.fire('all', []);
                return;
            }
    
            //非空的任务列表。
            let total = list.length;        //总项数。
            let values = new Array(total);  //收集每项异步操作的返回值。
    
    
            function process(index) {
                let item = list[index];
    
                //第三个参数是一个回调函数，即 done(value); 
                //由业务层调用，以通知异步操作完成。
                //done(value); 接受一个参数作为此项异步操作的返回值进行收集，
                //最后会在全部完成后一起传过去给业务层。
                meta.emitter.fire('each', [item, index, function (value) {
                    values[index] = value; //需要收集的值，由调用者传入。
                    index++;
    
                    if (index < total) {
                        process(index);
                    }
                    else {
                        meta.emitter.fire('all', [values]);
                    }
                }]);
            }
    
            process(0);
    
        }
    
        /**
        * 绑定事件。
        */
        on(...args) {
            let meta = mapper.get(this);
            meta.emitter.on(...args);
        }
    
    
        
     
    
    }
    
    //静态成员。
    Object.assign(Tasker, {
        /**
        * 支持多个并发异步加载操作，实际只会加载一次。
        * 如果在加载过程中，再发起加载请求，则会放入待办列表中，加载完成后再依次执行。
        * @param {String} sid 异步加载的名称，以此作为区分。 同一个名称的拥有同一个待办队列。
        * @param {*} todo 要添加的待办项，可以是任意值。
        * @param {function} load 实际要发起的异步加载操作函数。 异步加载函数体内必须显式调用传过去的函数，以调用异步加载完成。
        */
        todo(sid, todo, load) {
            let todos = sid$todos[sid];
    
            if (todos) {
                todos.push(todo);
                return;
            }
    
    
            todos = sid$todos[sid] = [todo];
    
            load(function (each) {
                sid$todos[sid] = null;
    
                if (typeof each == 'function') {
                    todos.forEach(function (todo, index) {
                        each(todo, index);
                    });
                }
    
                return todos;
            });
        }
    });
    
    module.exports = Tasker;
});
/**
* src: @definejs/timer/modules/Timer.js
* pkg: @definejs/timer@1.0.0
*/
define('Timer', function (require, module, exports) { 
    /**
    * 计时器。
    */
    
    
    const mapper = new Map();
    
    class Timer {
        /**
        * 构造器。
        */
        constructor() {
            let meta = {
                t0: 0,
                list: [],
            };
    
            mapper.set(this, meta);
        }
    
        /**
        * 开始计时。
        */
        start() {
            let meta = mapper.get(this);
            meta.t0 = new Date();
        }
    
        /**
        * 停止计时。
        * @param {string} unit 对时间差进行转换的单位，可取的值为：
        *   `ms`: 毫秒(默认值)。
        *   `s`: 秒。
        *   `m`: 分。
        *   `h`: 小时。
        *   `d`: 天。
        * @returns 返回一个对象，结构为 
        *   {
        *       t0: Date,       //开始时间。
        *       t1: Date,       //结束时间。
        *       dt: Number,     //时间差，即耗时，单位为毫秒。
        *       value: Number,  //针对参数 unit 传入的单位转换后的时间差值。 
        *       unit: string,   //参数 unit 传入的值。
        *   }
        */
        stop(unit = 'ms') {
            let meta = mapper.get(this);
            let t0 = meta.t0;
            let t1 = new Date();
            let dt = t1 - t0;
            let value = 0;
    
            let item = {
                't0': t0,
                't1': t1,
                'dt': dt,
                'value': 0,
                'unit': '',
            };
    
            switch (unit) {
                case 'ms':
                    value = dt;
                    break;
                case 's':
                    value = Math.ceil(dt / 1000);
                    break;
                case 'm':
                    value = Math.ceil(dt / 1000 / 60);
                    break;
                case 'h':
                    value = Math.ceil(dt / 1000 / 3600);
                    break;
                case 'd':
                    value = Math.ceil(dt / 1000 / 3600 / 24);
                    break;
                default:
                    throw new Error(`无法识别的参数 unit，只允许是以下值之一：ms、s、m、h、d。`);
            }
    
            if (value) {
                item.value = value;
                item.unit = unit;
            }
    
            meta.list.push(item);
    
            return item;
        }
    
        /**
        * 获取所有的计时历史列表。
        */
        list() {
            let meta = mapper.get(this);
            return [...meta.list,];
        }
    
        /**
        * 重置计时器。
        * 会清空所有的计时历史，回到创建时的状态。
        */
        reset() { 
            let meta = mapper.get(this);
    
            meta.t0 = 0;
            meta.list = [];
        }
    }
    
    module.exports = Timer;
});
/**
* src: @definejs/api/modules/API/Ajax.js
* pkg: @definejs/api@1.0.0
*/
define('API/Ajax', function (require, module, exports) { 
    
    const $Object = require('Object');
    const $String = require('String');
    const $JSON = require('JSON');
    const Proxy = require('Proxy');
    const Query = require('Query');
    
    /**
    * 发起 ajax 网络请求(核心方法)。
    *   method: 'get' | 'post', //网络请求的方式：'get' 或 'post'。
    *   config = {
    *       url: '',            //可选，请求的 url 地址。
    *       prefix: '',         //可选，url 的前缀。
    *       name: '',           //必选，后台接口的名称，会用在 url 中。
    *       ext: '',            //可选，要用在 url 中的后缀。
    *       successCode: 200,   //指示请求成功时的代码。 数字或字符串。
    *       random: true,       //是否给 url 加上随机数，以刷新缓存。
    *       proxy: false,       //是否启用代理。 要启用，可以指定为 true，或一个具体的 json 或 js 文件名。
    *       timeout: 0,         //超时时间。 如果指定为 0，则使用浏览器内置的超时管理，会调用 error 回调函数。
    *
    *       //该数据会给序列化成查询字符串，然后：
    *       //当 method 为 'get' 时，数据拼接在 url 中。
    *       //当 method 为 'post' 时，数据放在 form-data 表单中。
    *       data: {},           //可选，要发送的数据。 
    *       query: {},          //可选，要发送的查询字符串数据。 该字段仅在 method 为 'post' 时可用。
    *       headers: {},        //可选，要发送的请求头数据。
    *
    *       field: {            //可选，响应中的映射字段。 如果不指定为 null，则不当成 json 进行解析。
    *           code: 'code',   //状态码。
    *           msg: 'msg',     //消息。
    *           data: 'data',   //主体数据。
    *       },
    *
    *       success: fn,        //请求成功时的回调函数。
    *       fail: fn,           //请求失败时的回调函数。
    *       error: fn,          //请求错误时的回调函数。
    *       ontimeout: fn,      //请求超时时的回调函数。
    *       serialize: fn,      //对 data 字段的子对象进行序列化的方法。
    *   };
    *
    * 返回： 
    *   XMLHTTPRequest 实例对象 xhr。 
    *   如果使用的是代理，则返回 null。
    */
    function request(method, config) {
        let proxy = config.proxy;
    
        if (proxy) { //使用了代理
            Proxy.request(proxy, config);
            return null;
        }
    
    
        //完整的 url
        let url = [
            config.url,
            config.prefix,
            config.name,
            config.ext,
        ].join('');
    
    
        let data = config.data || null; // null 可能会在 xhr.send(data) 里用到。
    
        if (data) {
            let serialize = config.serialize; //对子对象进行序列化的方法。
    
            data = $Object.map(data, function (key, value) {
                if (typeof value == 'object' && value) { //子对象编码成 JSON 字符串
                    return serialize(key, value);
                }
    
                //其他的
                return value; //原样返回
            });
        }
    
    
        if (method == 'post') {
            let query = config.query;
            if (query) {
                url = Query.add(url, query);
            }
            if (data) {
                data = Query.stringify(data);
            }
        }
        else if (data) { // 'get'
            url = Query.add(url, data);
            data = null; //要发送的数据已附加到 url 参数上
        }
    
    
        //增加一个随机字段，以使缓存失效
        let random = config.random;
        if (random) {
            random = $String.random(4);
            url = Query.add(url, random);
        }
    
    
        //同时启动超时器和发起请求，让它们去竞争。
    
        let isTimeout = false; //指示是否已超时
        let tid = null;
        let timeout = config.timeout || 0;
    
        if (timeout > 0) {
            tid = setTimeout(function () {
                isTimeout = true;
                xhr.abort(); //取消当前响应，关闭连接并且结束任何未决的网络活动。
    
                let fn = config.ontimeout;
                fn && fn(xhr);
    
            }, timeout);
        }
    
    
        let xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
    
        xhr.onreadystatechange = function () {
            if (isTimeout || xhr.readyState != 4) {
                return;
            }
    
    
            clearTimeout(tid);
    
            let successCode = config.successCode;
            let fnError = config.error;
            let fnSuccess = config.success;
            let fnFail = config.fail;
            let field = config.field || null;
    
            if (xhr.status != 200) {
                fnError && fnError(xhr);
                return;
            }
    
            //没有指定 field 字段映射规则，则直接当作是请求成功了。
            if (!field) {
                fnSuccess && fnSuccess(xhr);
                return;
            }
    
            //以下都是指定了 field 字段映射规则的，则尝试解析成 json。
            let json = $JSON.parse(xhr.responseText);
    
            if (!json) {
                fnError && fnError(xhr);
                return;
            }
    
            let code = json[field.code];
    
            if (code == successCode) {
                let data = field.data in json ? json[field.data] : {};
                fnSuccess && fnSuccess(data, json, xhr);
            }
            else {
                let msg = json[field.msg];
                fnFail && fnFail(code, msg, json, xhr);
            }
        };
    
        //设置请求头。
        let headers = config.headers;
    
        if (headers) {
            $Object.each(headers, function (key, value) {
                xhr.setRequestHeader(key, value);
            });
        }
    
    
        if (method == 'post') {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
    
        xhr.send(data);
    
        return xhr;
    }
    
    
    module.exports = {
    
        get(config) {
            return request('get', config);
        },
    
        post(config) {
            return request('post', config);
        },
    };
});
/**
* src: @definejs/api/modules/API.defaults.js
* pkg: @definejs/api@1.0.0
*/
define('API.defaults', function (require, module, exports) { 
    /**
    * API 模块的默认配置
    */
    module.exports = {
        /** 
        * 响应的数据类型。
        * 只有指定为 `json` 时才进行 JSON 解析，如果请求成功了但解析失败则调用 fail 函数。
        */
        type: 'json',
        /**
        * 成功的状态码。 
        * 只有状态码为该值是才表示成功，其它的均表示失败。
        */
        successCode: 200,
        /**
        * 字段映射。
        * 如果指定为 null，则不对响应进行 json 解析。 即只有指定具体的映射规则时，才把响应当成 json 进行解析。
        */
        field: {
            /**
            * 状态码。
            */
            code: 'code',
            /**
            * 消息。
            */
            msg: 'msg',
            /**
            * 主体数据。
            */
            data: 'data',
        },
        /**
        * 代理配置。
        */
        proxy: null,
        /**
        * 随机延迟时间，更真实模拟实际网络环境。
        * 可指定为 false，或如 { min: 500, max: 2000 } 的格式。
        */
        delay: false,
        /**
        * 在 url 中增加一个随机 key，以解决缓存问题。
        * 当指定为 false 时，则禁用。
        */
        random: true,
        /**
        * API 接口 Url 的主体部分。
        */
        url: '',
        /**
        * API 接口 Url 的前缀部分。
        */
        prefix: '',
        /**
        * API 接口 Url 的后缀部分。
        * 针对那些如 '.do'、'.aspx' 等有后缀名的接口比较实用。
        */
        ext: '',
        /**
        * 要发送的数据。 可选的。
        * 当发送方式为 get 时，该数据将会给序列化成查询字符串并附加到 url 查询参数中。
        * 当发送方式为 post 时，会用在表单中。
        */
        data: null,
        /**
        * 要发送的查询参数，仅当发送方式为 post 时有效 (可选的)。
        * 当发送方式为 post 时，该数据将会给序列化成查询字符串并附加到 url 查询参数中。
        */
        query: null,
        /**
        * 要发送的请求头。
        */
        headers: null,
        /**
        * 请求超时的最大值(毫秒)。
        * 0 表示由浏览器控制，代码层面不控制。
        */
        timeout: 0,
        /**
        * 把请求时的 data 中的第一级子对象进行序列化的方法。
        * @param {string} key 要进行处理的子对象的键。
        * @param {Object} value 要进行处理的子对象的值对象。
        * @return {string} 返回该子对象序列化的字符串。
        */
        serialize: function (key, value) {
            let json = JSON.stringify(value);
            return encodeURIComponent(json);
        },
        /**
        * 用于发起 ajax 请求的 get 方法。
        * 如果想实现自己的 get 方法，可以提供此函数。
        * 否则使用内部默认的 Ajax.get() 方法。
        */
        get: null,
        /**
        * 用于发起 ajax 请求的 post 方法。
        * 如果想实现自己的 post 方法，可以提供此函数。
        * 否则使用内部默认的 Ajax.post() 方法。
        */
        post: null,
    };
});
/**
* src: @definejs/api/modules/API.js
* pkg: @definejs/api@1.0.0
*/
define('API', function (require, module, exports) { 
    const $Object = require('Object');
    const Emitter = require('Emitter');
    const Fn = require('Fn');
    const Ajax = module.require('Ajax');
    
    const mapper = new Map();
    
    
    class API {
        /**
        * API 构造器。
        * 已重载 API(config);         此时 name 为空串。
        * 已重载 API(name, config);     
        * @param {string} name 后台接口的名称。 简短名称，且不包括后缀。
        * @param {Object} [config] 配置对象。
        *   config = {
        *
        *   };
        */
        constructor(name, config) {
            //重载 API(config);
            if (typeof name == 'object') {
                config = name;
                name = '';
            }
    
            name = name || '';
            config = $Object.deepAssign({}, exports.defaults, config);
    
    
            let emitter = new Emitter(this);
            let successCode = config.successCode;
            let proxy = config.proxy;
    
            //支持简写，代理的文件名跟 API 的名称一致。
            switch (proxy) {
                case true:
                    proxy = name + '.js';   //如 `getUsers.js`。
                    break;
                case '.json':
                case '.js':
                    proxy = name + proxy;   //如 `getUsers.json`。
                    break;
            }
    
            //发起 ajax 请求所需要的配置对象。
            let ajax = {
                'name': name,
                'data': config.data,
                'query': config.query,
                'url': config.url,
                'prefix': config.prefix,
                'ext': config.ext,
                'random': config.random,
    
                'successCode': successCode,
                'field': config.field,
                'proxy': proxy,
                'serialize': config.serialize,
                'timeout': config.timeout,
                'headers': config.headers,
    
                success(data, json, xhr) { //成功
                    fireEvent('success', [data, json, xhr]);
                },
    
                fail(code, msg, json, xhr) { //失败
                    fireEvent('fail', [code, msg, json, xhr]);
                },
    
                error(xhr) { //错误
                    if (meta.aborted) { //避免因手动调用了 abort() 而导致触发 error 事件。
                        meta.aborted = false; //归位
                        return;
                    }
    
                    fireEvent('error', [xhr]);
                },
    
                ontimeout(xhr) { //超时，自定义的
                    fireEvent('timeout', [xhr]);
                },
            };
    
            let meta = {
                'ajax': ajax,
                'status': '',
                'args': [],
                'emitter': emitter,
                'xhr': null,            //缓存创建出来的 xhr 对象。
                'aborted': false,       //指示是否已调用了 abort()。
                'fireEvent': fireEvent, //
    
                /**
                * 用于发起 ajax 请求的 get 方法。
                * 如果想实现自己的 get 方法，可以提供此函数。
                * 否则使用内部默认的 Ajax.get() 方法。
                */
                'get': config.get || Ajax.get,
    
                /**
                * 用于发起 ajax 请求的 post 方法。
                * 如果想实现自己的 post 方法，可以提供此函数。
                * 否则使用内部默认的 Ajax.post() 方法。
                */
                'post': config.post || Ajax.post,
            };
    
            mapper.set(this, meta);
    
    
            //内部共用函数。
            function fireEvent(status, args, emitter) {
                status = meta.status = status || meta.status;
                args = meta.args = args || meta.args;
                emitter = emitter || meta.emitter;
                meta.xhr = null; //请求已完成，针对 abort() 方法。
    
                let len = args.length;
                let xhr = args[len - 1];
                let json = args[len - 2];
                let isSuccess = status == 'success';
                let isFail = status == 'fail';
    
    
                Fn.delay(config.delay, function () {
                    //最先触发
                    let values = emitter.fire('response', [status, json, xhr]);
    
                    if (values.includes(false)) {
                        return;
                    }
    
    
                    //进一步触发具体 code 对应的事件
                    if (isSuccess || isFail) {
                        let code = isSuccess ? successCode : args[0];
                        values = emitter.fire('code', code, args);
    
                        if (values.includes(false)) {
                            return;
                        }
                    }
    
    
                    //在 Proxy 的响应中 xhr 为 null。
                    if (xhr) {
                        values = emitter.fire('status', xhr.status, args);
    
                        if (values.includes(false)) {
                            return;
                        }
                    }
    
                    //触发命名的分类事件，如 success|fail|error|timeout
                    values = emitter.fire(status, args);
    
                    if (values.includes(false)) {
                        return;
                    }
    
                    //触发总事件。
                    emitter.fire('done', [status, json, xhr]);
                });
            }
        }
    
    
        /**
        * 发起网络 GET 请求。
        * 请求完成后会最先触发相应的事件。
        * @param {Object} [data] 请求的数据对象。
        *   该数据会给序列化成查询字符串以拼接到 url 中。
        * @example
            var api = new API('test');
            api.get({ name: 'micty' });
        */
        get(data) {
            let meta = mapper.get(this);    //API 类给继承后，this 就是子类的实例。 比如 SSH 继承 API，则 this 为 SSH 的实例，不再是 API 的实例。
            let emitter = meta.emitter;
    
            meta.aborted = false; //归位
    
            let obj = Object.assign({}, meta.ajax);
            if (data) {
                obj.data = data;
            }
    
            data = obj.data;  //这里用 obj.data
    
            emitter.fire('request', 'get', [data]);
            emitter.fire('request', ['get', data]);
    
            meta.xhr = meta.get(obj);
    
        }
    
        /**
        * 发起网络 POST 请求。
        * 请求完成后会最先触发相应的事件。
        * @param {Object} [data] POST 请求的数据对象。
        * @param {Object} [query] 查询字符串的数据对象。
        *   该数据会给序列化成查询字符串，并且通过 form-data 发送出去。
        * @return {API} 返回当前 API 的实例 this，因此进一步可用于链式调用。
        */
        post(data, query) {
            let meta = mapper.get(this);
            let emitter = meta.emitter;
            let ajax = meta.ajax;
    
            meta.aborted = false; //归位
    
            let obj = Object.assign({}, ajax, {
                'data': data || ajax.data,
                'query': query || ajax.query,
            });
    
            data = obj.data;    //这里用 obj.data
            query = obj.query;  //这里用 obj.query
    
            emitter.fire('request', 'post', [data, query]);
            emitter.fire('request', ['post', data, query]);
    
    
            meta.xhr = meta.post(obj);
    
        }
    
        /**
        * 取消当前已发起但未完成的请求。
        * 只有已发起了请求但未完成，才会执行取消操作，并会触发 abort 事件。
        */
        abort() {
            let meta = mapper.get(this);
            let xhr = meta.xhr;
    
            if (!xhr) {
                return;
            }
    
            meta.aborted = true;        //先设置状态
            xhr.abort();                //会触发 ajax.error 事件。
            meta.emitter.fire('abort'); //
        }
    
    
        /**
        * 绑定事件。
        * 已重载 on({...}，因此支持批量绑定。
        * @return {API} 返回当前 API 的实例 this，因此进一步可用于链式调用。
        */
        on(...args) {
            let meta = mapper.get(this);
            let emitter = meta.emitter;
            let status = meta.status;
    
            emitter.on(...args);
    
            if (status) { //请求已完成，立即触发
                let emt = new Emitter(this); //使用临时的事件触发器。
                emt.on.apply(emt, args);
                meta.fireEvent(status, meta.args, emt);
                emt.destroy();
            }
    
        }
    
    
    
        /**
        * 销毁本实例对象。
        */
        destroy() {
            let meta = mapper.get(this);
            let emitter = meta.emitter;
    
            emitter.destroy();
            mapper.delete(this);
        }
    }
    
    API.defaults = require('API.defaults');
    module.exports = exports = API;
});
/**
* src: @definejs/proxy/modules/Proxy/Url.js
* pkg: @definejs/proxy@1.0.0
*/
define('Proxy/Url', function (require, module, exports) { 
    
    const Url = require('Url');
    const Query = require('Query');
    
    
    function get(url, base) {
        //绝对地址
        if (Url.isFull(url)) {
            return url;
        }
    
        //相对地址
        if (Url.isFull(base)) {
            return base + url;
        }
    
        let root = Url.root();
    
        if (url.slice(0, 1) != '/') {
            root = root + base;
        }
    
        return root + url;
    }
    
    
    module.exports = {
    
        get(url, base) {
            url = get(url, base);
            url = Query.random(url); //增加随机查询字符串，确保拿到最新的
    
            return url;
        },
    };
});
/**
* src: @definejs/proxy/modules/Proxy.defaults.js
* pkg: @definejs/proxy@1.0.0
*/
define('Proxy.defaults', function (require, module, exports) { 
    
    /**
    * Proxy 模块的默认配置
    * @name Proxy.defaults
    */
    module.exports = {
        /**
        * 加载代理响应文件的起始位置(或目录)。
        */
        base: '',
    
        /**
        * 为模拟真实网络环境而随机延迟的时间。
        * 格式为 { min: 500, max: 3000 }。
        * 当指定为 false 时，则禁用延迟。
        */
        delay: {
            /**
            * 随机延迟的最小毫秒数。
            */
            min: 500,
            /**
            * 随机延迟的最大毫秒数。
            */
            max: 3000,
        },
    };
});
/**
* src: @definejs/proxy/modules/Proxy.js
* pkg: @definejs/proxy@1.0.0
*/
define('Proxy', function (require, module, exports) { 
    const $Url = require('Url');
    const $JSON = require('JSON');
    const Fn = require('Fn');
    const Script = require('Script');
    const Url = module.require('Url');
    
    
    let current = null; //当前请求到的代理文件的响应结果 factory。
    
    
    //模拟一个网络的随机延迟时间去执行一个回调函数
    function delay(fn, ...args) {
        let delay = exports.defaults.delay;
        Fn.delay(delay, fn, args);
    }
    
    
    //加载完成后，根据状态分发事件。
    function done(json, config) {
        if (!json) {
            delay(config.error);
            return;
        }
    
        let successCode = config.successCode;
        let field = config.field;
        let code = json[field.code];
    
        if (code == successCode) { // 成功
            let data = json[field.data] || {};
            delay(config.success, data, json);
        }
        else { //失败
            let msg = json[field.msg] || '';
            delay(config.fail, code, msg, json);
        }
    }
    
    /**
    * 加载指定的 js 代理文件。
    * 注意：加载完 js 代理文件后，会先执行 js 代理文件的逻辑，再触发 onload 事件。
    * 经过试验发现，并发加载多个 js 文件，也会严格地按上述顺序对应的进行。
    */
    function loadJS(file, config) {
        let base = exports.defaults.base;
        let url = Url.get(file, base);
    
        Script.load(url, function () {
            let factory = current;
            current = null;
    
            if (typeof factory == 'function') {
                factory = factory(config.data, config);
            }
    
            done(factory, config);
    
        });
    }
    
    /**
    * 加载指定的 json 代理文件。
    */
    function loadJSON(file, config) {
        let base = exports.defaults.base;
        let url = Url.get(file, base);
        let xhr = new XMLHttpRequest();
    
        xhr.open('get', url, true);
    
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4) {
                return;
            }
    
            if (xhr.status != 200) {
                delay(config.error);
                return;
            }
    
            let json = $JSON.parse(xhr.responseText);
    
            done(json, config);
        };
    
        xhr.send(null);
    }
    
    
    module.exports = exports = {
        /**
        * 默认配置。 
        */
        defaults: require('Proxy.defaults'),
        
        /**
        * 发起代理请求。
        * @param {String} file 代理响应的文件地址。
        * @param {Object} config 配置对象。
        */
        request(file, config) {
            if ($Url.isExt(file, '.js')) { // 映射的响应是一个 js 文件
                loadJS(file, config);
                return;
            }
    
            if ($Url.isExt(file, '.json')) {
                loadJSON(file, config);
                return;
            }
    
            throw new Error('不支持参数 file 的文件类型: ' + file);
        },
    
        /**
        * 响应代理请求。
        * 可以生成很复杂的动态数据，并根据提交的参数进行处理，具有真正模拟后台逻辑的能力。
        * 该方法仅用在代理响应文件中，且在调用之前必须先调用 request 方法。
        * 已重载 response(json)的情况。
        * @param {function|Object} factory 响应的处理函数或 json 对象。
        *   当传进来的 factory 为处理函数时，该函数会接收到两个参数：factory(data, config)。 其中：
        *   data 为发起 get 或 post 请求时最终的 data 字段；
        *   config 为发起 get 或 post 请求时全部的配置字段。
        */
        response(factory) {
            //var type = typeof factory;
            //var isValid = type == 'function' || type == 'object' && factory;
    
            //if (!isValid) {
            //    throw new Error('参数 factory 只能是函数或非空对象');
            //}
    
            current = factory;
        },
    
    };
});
/**
* src: @definejs/script/modules/Script.defaults.js
* pkg: @definejs/script@1.0.0
*/
define('Script.defaults', function (require, module, exports) { 
    
    module.exports = {
        url: '',
        id: '',
        charset: 'utf-8',
        document: window.document,
        onload: null,
    };
});
/**
* src: @definejs/script/modules/Script.js
* pkg: @definejs/script@1.0.0
*/
define('Script', function (require, module, exports) { 
    
    const $Object = require('Object');
    
    /**
    * 加载单个 js 文件。
    */
    function loadItem(url, charset, document, onload) {
        let id;
    
        if (typeof url == 'object') { //传入的是一个 {} 
            let config = url;
    
            id = config.id;
            url = config.url;
            charset = config.charset;
            document = config.document;
            onload = config.onload;
        }
    
    
        let script = document.createElement('script');
    
        if (onload) { //指定了回调函数，则设置它
            if (script.readyState) { //IE
                /**@ignore*/
                script.onreadystatechange = function () {
                    let readyState = script.readyState;
    
                    if (readyState == 'loaded' || readyState == 'complete') {
                        script.onreadystatechange = null; //避免重复执行回调
                        onload();
                    }
                };
            }
            else { //标准
                script.onload = onload;
            }
    
        }
    
        script.src = url;
    
        if (charset) {
            script.charset = charset;
        }
    
        if (id) {
            script.id = id;
        }
    
        document.head.appendChild(script);
    }
    
    /**
    * 顺序加载批量 js 文件。
    */
    function loadList(urls, charset, document, fn) {
        if (urls.length == 0) {
            fn && fn();
            return;
        }
    
    
        let index = 0;
    
        (function next () {
            let url = urls[index];
    
            loadItem(url, charset, document, function () {
                index++;
    
                if (index < urls.length) {
                    next();
                }
                else {
                    fn && fn();
                }
            });
    
        })();
    }
    
    
    
    module.exports = exports = {
        /**
        * 默认配置。
        */
        defaults: require('Script.defaults'),
    
        /**
        * 跨浏览器动态加载 JS 文件，并在加载完成后执行指定的回调函数。
        * @param {string|Array} opt.url 要加载的 JS 文件的 url 地址，如果要批量加载，则为一个地址数组。
        * @param {string} [opt.charset="utf-8"] 要加载的 JS 文件的字符编码，默认为 utf-8。
        * @param {Document} [opt.document=window.document] 要加载的 JS 文件的上下文环境的 document，默认为当前窗口的 document 对象。
        * @param {function} [opt.onload] 加载成功后的回调函数。
        * @example
            Script.load({
                url: 'a.js',
                charset: 'utf-8',
                document: document,
                id: 'myScript',
                onload(){ }
            });
    
            Script.load('a.js', 'utf-8', document, function(){});
            Script.load('a.js', 'utf-8', function(){});
            Script.load('a.js', document, function(){});
            Script.load('a.js', function(){});
    
            //批量加载
            Script.load(['a.js', 'b.js'], function(){});
        */
        load(opt) {
            let obj = { ...exports.defaults, };//复制一份
    
            //注意，params 有可能是个数组，不能用 typeof 为 'object'
            if ($Object.isPlain(opt)) { //纯对象 {}
                Object.assign(obj, opt);
            }
            else {
                obj.url = opt;
    
                switch (typeof arguments[1]) {
                    case 'string':
                        obj.charset = arguments[1];
                        break;
                    case 'object':
                        obj.document = arguments[1];
                        break;
                    case 'function':
                        obj.onload = arguments[1];
                        break;
                }
    
                switch (typeof arguments[2]) {
                    case 'object':
                        obj.document = arguments[2];
                        break;
                    case 'function':
                        obj.onload = arguments[2];
                        break;
                }
    
                if (arguments[3]) {
                    obj.onload = arguments[3];
                }
            }
    
            let url = obj.url;
    
            if (typeof url == 'string') {
                loadItem(obj);
            }
            else if (Array.isArray(url)) {
                loadList(url, obj.charset, obj.document, obj.onload);
            }
            else {
                throw new Error('参数 opt.url 必须为 string 或 string 的数组');
            }
    
        },
    };
});
/**
* src: @definejs/url/modules/Url.defaults.js
* pkg: @definejs/url@1.0.0
*/
define('Url.defaults', function (require, module, exports) { 
    /**
    * Url 模块的默认配置。
    * @name Url.defaults
    */
    module.exports = {
        //这里取当前页面的路径作为根地址。
        //注意：只适用于当前页面在根目录的情况。
        //IE10 及以下 location.origin 不存在。
        root() { 
            return `${location.protocol}//${location.host}${location.pathname.split('/').slice(0, -1).join('/')}/`;
        },
    
    };
});
/**
* src: @definejs/url/modules/Url.js
* pkg: @definejs/url@1.0.0
*/
define('Url', function (require, module, exports) { 
    module.exports = exports = {
        /**
        * 默认配置。
        */
        defaults: require('Url.defaults'),
        
        /**
        * 获取当前 web 站点的根目录。
        */
        root() {
            let root = exports.defaults.root;
    
            if (typeof root == 'function') {
                root = root();
            }
    
            //确保以 '/' 结尾。
            if (!root.endsWith('/')) {
                root += '/';
            }
    
            return root;
        },
    
        /**
        * 获取 url 的主体部分，即去掉 query 和 hash 后的部分。
        * @param {String} url 要解析的 url 地址。
        * @returns {String} 返回解析后的 url 地址。
        */
        main(url) {
            url = url.split('#')[0];
            url = url.split('?')[0];
    
            return url;
        },
    
        /**
         * 检查给定的 url 是否为完整的 url。
         * 即是否以 'http://' 或 'https://' 开头。
         * @param {String} url 要检查的 url。
         * @returns {boolean} 返回 true 或 false。
         */
        isFull(url) {
            if (typeof url != 'string') {
                return false;
            }
    
            return url.startsWith('http://') ||
                url.startsWith('https://');
        },
    
        /**
        * 检测指定的 url 是否为特定的扩展名类型的文件。
        * @param {string} url 要检测的文件名。
        * @param {string} ext 要检测的扩展名，以 "." 开始。
        * @return {boolean} 如果该文件名以指定的扩展名结尾，则返回 true；否则返回 false。
        * @example 
            Url.is('a/b/c/login.JSON', '.json'); //返回 true
        */
        isExt(url, ext) {
            if (typeof url != 'string' || typeof ext != 'string') {
                return false;
            }
    
            url = exports.main(url);
    
            return url.slice(0 - ext.length).toLowerCase() == ext.toLowerCase();
        },
    
    
        /**
        * 解析路径。
        * 这是一个第三方库的方法 resolveUrl。
        */
        resolve(baseUrl /* ...urls */) {
            var len = arguments.length;
            if (len == 0) {
                throw new Error('resolveUrl requires at least one argument; got none.');
            }
    
            var base = document.createElement('base');
            base.href = baseUrl;
    
            if (len == 1) {
                return base.href;
            }
    
    
            var head = document.head;
            head.insertBefore(base, head.firstChild);
    
            var url = '';
            var a = document.createElement('a');
    
    
            for (var i = 1; i < len; i++) {
                a.href = arguments[i];
                url = a.href;
                base.href = url;
            }
    
            head.removeChild(base);
    
            return url;
        },
    };
});
/**
* src: @definejs/app/modules/App/Navigator/Views.js
* pkg: @definejs/app@1.0.0
*/
define('App/Navigator/Views', function (require, module, exports) { 
    const $ = require('jquery');
    const Tasker = require('Tasker');
    const Package = require('Package');
    
    const name$appended = {}; //记录视图对应的 html 内容是否已附加到容器中。
    
    
    function normalize(views) {
        let list = Array.isArray(views) ? views : [views];
        let all = [];
    
        list.forEach((item, index) => { 
            if (!item) {
                return;
            }
    
            if (typeof item == 'string') {
                item = {
                    'view': item,
                    'args': [],
                };
            }
    
            all.push(item);
    
        });
    
        return all;
    }
    
    
    
    
    module.exports = {
        /**
        * 加载多个视图。
        *   options = {
        *       container: 'body',  //视图所要附加到的容器。
        *       module: Module,     //业务层顶级的 module 对象。 即 KISP.launch() 方法中回调函数的第二个参数 `module`，用于加载视图。
        *   };
        */
        load(views, options, done) {
            let list = normalize(views);
            let $module = options.module;
            let container = options.container;
    
            let tasker = new Tasker(list);
    
    
            //先异步加载完所有的视图模块。
            //可能是异步，也可能是直接加载。
            tasker.on('each', function (item, index, done) {
                let name = item.view;
                let M = $module.require(name);
    
                //已加载过了。
                if (M) {
                    done(M);
                    return;
                }
    
                Package.load(name, function (pack) {
                    if (!pack) {
                        throw new Error(`总包中不存在名为 ${name} 的配置节点。`);
                    }
    
                    let item = pack['html'] || {};
                    let html = item.content;
                    let appended = name$appended[name];
    
                    //先处理 html 内容。
                    if (!appended && container && html) {
                        name$appended[name] = true;
                        $(container).append(html);
                    }
    
    
                    //再加载 js 模块。
                    //因为 js 模块可能会用到对应的 DOM 节点。
                    let M = $module.require(name);
    
                    if (!M) {
                        throw new Error(`不存在名为 ${name} 的视图模块`);
                    }
    
                    done(M);
                });
    
            });
    
    
            tasker.on('all', function (views) {
                done && done(...views);
            });
    
    
            tasker.parallel();
        },
    
    };
    
    
    
    
    
    
    
    
    
});
/**
* src: @definejs/app/modules/App/Navigator.js
* pkg: @definejs/app@1.0.0
*/
define('App/Navigator', function (require, module, exports) { 
    const Navigator = require('Navigator');
    const Views = module.require('Views');
    
    module.exports = {
        /**
        * 创建一个带视图滑动效果和滑动返回手势支持的导航器。
        *   options = {
        *       ViewSlider: null,   //针对移动端的视图滑动器。
        *       id: '',             //导航器的唯一名称。 因为一个应用里可以存在多个导航器，为区分存储中的数据，须提供一个名称。
        *       module: Module,     //业务层顶级的 module 对象。 即 KISP.launch() 方法中回调函数的第二个参数 `module`，用于加载视图。
        * 
        *       container: 'body',  //视图所要附加到的容器。
        *       preload: true,      //是否按需提前加载视图的分包资源。
        *       slide: true,        //是否启用滑动返回手势支持。
        *       animate: true,      //是否启用视图间的前进/后退的过渡动画效果。
        *   };
        */
        create(options) {
            let ViewSlider = options.ViewSlider;
            let animateEnabled = options.animate;
            let slideEnabled = options.slide;
    
            if (animateEnabled && !ViewSlider) {
                throw new Error('指定了参数 animate 为 true，必须提供 ViewSlider 以启用视图切换的动画效果（仅针对移动端）。');
            }
    
            if (slideEnabled && !ViewSlider) {
                throw new Error('指定了参数 slide 为 true，必须提供 ViewSlider 以启用滑动返回手势支持（仅针对移动端）。');
            }
    
    
            let $module = options.module;
            let nav = new Navigator(options.id);
    
    
            //针对滑动返回的。
            //让浏览器的地址栏跟随着后退，但不触发 KISP 内部相应的事件。
            let back = () => { 
                nav.back(false);
            };
    
            /**
            * 跳到指定视图时触发。
            * 包括主动跳转、前进、后退、刷新。
            * 实现根据目标视图的状态信息进行显示或渲染。
            */
            nav.on('view', function (target, args, info) {
                //target 可能尚未加载回来。
                Views.load(target, options, function (target) {
                    if (info.cache && target.rendered()) {
                        target.show();
                    }
                    else {
                        target.render(...args);
                    }
                });
            });
    
    
            if (options.preload) {
                /**
                * 通过输入地址栏的地址，或刷新浏览器时触发。
                * 根据缓存到的视图信息，按时间戳进行排序，重建滑动返回顺序的手势支持。
                */
                nav.on('immediate', function (hash, hash$info) {
                    //视图信息列表。
                    let infos = Object.keys(hash$info).map(function (hash) {
                        return hash$info[hash];
                    });
    
                    //按时间戳降序排序。
                    infos = infos.sort(function (a, b) {
                        return a.timestamp > b.timestamp ? -1 : 1;
                    });
    
                    Views.load(infos, options, function () {
                        if (!slideEnabled) {
                            return;
                        }
    
                        infos.slice(0, -1).forEach(function (current, index) {
                            let target = infos[index + 1];
                            let args = target.args;
    
                            current = $module.require(current.view);
                            target = $module.require(target.view);
    
                            ViewSlider.slide(current, target, {
                                'args': args,   //目标视图的渲染参数。
                                'back': back,   //
                            });
                        });
                    });
    
    
                });
            }
    
    
            if (slideEnabled) {
                /**
                * 从当前视图主动跳转到目标视图时触发。
                * 绑定目标视图到当前视图的手势滑动返回支持。
                */
                nav.on('to', function (current, target, info) {
                    current = $module.require(current);
    
                    //target 可能尚未加载回来。
                    Views.load(target, options, function (target) {
    
                        //这里 current 与 target 反过来。
                        ViewSlider.slide(target, current, {
                            'back': back,
                        });
                    });
    
                });
            }
    
    
            /**
            * 通过浏览器的前进时触发。
            * 实现从当前视图到目标视图的滑动过渡效果。
            */
            nav.on('forward', function (current, target) {
                current = $module.require(current);
    
                //target 可能尚未加载回来。
                Views.load(target, options, function (target) {
                    if (animateEnabled) {
                        ViewSlider.forward(current, target);
                    }
                    else {
                        current.hide();
                        target.show();
                    }
                });
    
            });
    
            /**
            * 通过浏览器的后退时触发。
            * 实现从目标视图到当前视图的滑动过渡效果。
            */
            nav.on('back', function (current, target) {
                current = $module.require(current);
    
                Views.load(target, options, function (target) {
                    if (animateEnabled) {
                        ViewSlider.back(current, target);
                    }
                    else {
                        current.hide();
                        target.show();
                    }
                });
    
            });
    
            return nav;
    
        },
    
    };
    
    
    
    
    
    
    
    
    
});
/**
* src: @definejs/app/modules/App/Router.js
* pkg: @definejs/app@1.0.0
*/
define('App/Router', function (require, module, exports) { 
    
    const $Object = require('Object');
    const name$factory = {};
    
    
    //示例解释：
    /*
    KISP.route('User', function (require, module) {
        //以下两种写法是等价的。
        //如果是写法一，则 KISP 内部也会转换成写法二。
        //写法一简单明了，但写法二功能更自由、丰富。
        //一般情况下用写法一，必要时可用写法二。
    
        //写法一。
        return {
            'login': function () { },
            'logout': function () { },
        };
    
        //写法二。
        return function (User) {
            User.on({
                'login': function () { },
                'logout': function () { },
            });
        };
    });
    */
    
    /**
    * 路由。
    */
    module.exports = {
    
        /**
        * 设置路由。
        * @param {string} name 路由的名称。
        * @param {function} factory 路由处理函数。
        *   也可以是一个导出对象。
        */
        set(name, factory) {
            if (name$factory[name]) {
                throw new Error(`重复定义的路由器: ${name}`);
            }
    
            name$factory[name] = factory;
        },
    
        /**
        * 绑定全部路由。
        */
        bind($require, $module, $exports) {
    
            let all = $Object.map(name$factory, function (name, factory) {
    
                if (typeof factory == 'function') {
                    factory = factory($require, $module, $exports);
                }
    
                return factory;
    
            });
    
            $module.bind(all);
    
            return all;
        },
    };
    
    
    
    
    
});
/**
* src: @definejs/app/modules/App.defaults.js
* pkg: @definejs/app@1.0.0
*/
define('App.defaults', function (require, module, exports) { 
    /**
    * App 模块的默认配置。
    * @name App.defaults
    */
    module.exports = {
        //针对移动端的。
        ViewSlider: null,   
        /**
        * 应用的根节点模块，一般建议保留为空字符串。
        */
        root: '',
        /**
        * 应用的唯一名称。
        * 用于在存储中区分其它应用。
        */
        name: '',
        seperator: '/',
        navigator: 'app-default-navigator',
        /**
        * 针对视图的配置。
        */
        view: { },
    };
    
    
});
/**
* src: @definejs/app/modules/App.js
* pkg: @definejs/app@1.0.0
*/
define('App', function (require, module, exports) { 
    
    /**
    * App 启动类。 
    * @name App
    */
    
    const SessionStorage = require('SessionStorage');
    const LocalStorage = require('LocalStorage');
    const AppModule = require('AppModule');              //对外给页面提供的，即业务层的模块管理器。
    
    //子模块。
    const Navigator = module.require('Navigator');
    const Router = module.require('Router');
    
    
    
    module.exports = exports = {
        /**
        * 默认配置。
        */
        defaults: require('App.defaults'),
    
        /**
        * 初始化执行环境，并启动应用程序。
        * @param {function} factory 工厂函数，即启动函数。
        */
        launch(factory) {
            const defaults = exports.defaults;
            const { name, root, seperator, navigator, view, } = defaults;
    
            //app 应用的名称。
            if (!name) {
                throw new Error('必须首先给应用分配一个唯一的名称，用于在存储中与其它应用区分开。');
            }
    
            //app 顶级模块的名称，一般为空字符串。
            if (typeof root != 'string') {
                throw new Error('应用的顶级模块名称必须为一个 string。');
            }
    
            //父子模块的分隔符，一般为 `/`。
            if (root.includes(seperator)) {
                throw new Error('应用的顶级模块名称不能含有父子模块的分隔符: ' + seperator);
            }
    
            //让 app 的名称同时用于以下模块。
            SessionStorage.defaults.name = name;
            LocalStorage.defaults.name = name;
    
            //扩展配置。
            Object.assign(AppModule.defaults, {
                seperator,
            });
    
            //先定义一个顶级的模块。
            AppModule.define(root, function ($require, $module, $exports) {
                if (navigator) {
                    //此时 $exports 即为 factory 工厂函数中的第三个参数 nav。
                    $exports = Navigator.create({
                        'ViewSlider': defaults.ViewSlider,
                        'id': navigator,
                        'module': $module,
    
                        'container': view.container,
                        'preload': view.preload,
                        'slide': view.slide,
                        'animate': view.animate,
                    });
                }
    
    
                Router.bind($require, $module, $exports);
    
                factory && factory($require, $module, $exports);
            });
    
            //定义完后马上加载即可启动。
            AppModule.require(root);
    
        },
    
        /**
        * 设置视图的顶级事件路由。
        */
        route: Router.set,
    
        
    
    };
    
    
    
    
    
});
/**
* src: @definejs/local-storage/modules/LocalStorage/Storage.js
* pkg: @definejs/local-storage@1.0.0
*/
define('LocalStorage/Storage', function (require, module, exports) { 
    const CircularJSON = require('circular-json');
    const storage = window.localStorage;
    const key = `@definejs/local-storage`;
    let json = storage.getItem(key) || '{}';    //全部数据的字符串形式。
    let all = CircularJSON.parse(json) || {};        //全部数据的对象形式。  
    
    
    //保存到浏览器层面的存储。
    function save() {
        json = CircularJSON.stringify(all);
        storage.setItem(key, json);
    }
    
    
    module.exports = {
        /**
        * 设置一对键值。
        * @param {string} key 要进行设置的键名称。
        * @param value 要进行设置的值，可以是任何类型。
        */
        set(key, value) {
            all[key] = value;
            save();
        },
    
        /**
        * 根据给定的键获取关联的值。
        * @param {string} key 要进行获取的键名称。
        * @return 返回该键所关联的值。
        */
        get(key) {
            return all[key];
        },
    
        /**
        * 移除给定的键所关联的项。
        * @param {string} key 要进行移除的键名称。
        */
        remove(key) {
            delete all[key];
            save();
        },
    
        /**
        * 清空所有项。
        */
        clear() {
            all = {};
            save();
        },
    };
});
/**
* src: @definejs/local-storage/modules/LocalStorage.defaults.js
* pkg: @definejs/local-storage@1.0.0
*/
define('LocalStorage.defaults', function (require, module, exports) { 
    
    /**
    * LocalStorage 模块的默认配置
    * @name LocalStorage.defaults
    */
    module.exports = {
        /**
        * 应用的名称。
        * 设定后即可创建与获取在该名称下的本地存储，从而避免跟其它应用的冲突。
        */
        name: '',
    };
});
/**
* src: @definejs/local-storage/modules/LocalStorage.js
* pkg: @definejs/local-storage@1.0.0
*/
define('LocalStorage', function (require, module, exports) { 
    
    const $Object = require('Object');
    const Storage = module.require('Storage');
    const mapper = new Map();
    
    /**
    * 本地存储工具类。。
    *
    * localStorage 属性允许你访问一个 session Storage 对象。
    * 它与 localStorage 相似，不同之处在于 localStorage 里面存储的数据没有过期时间设置，
    * 而存储在 localStorage 里面的数据在页面会话结束时会被清除。
    * 页面会话在浏览器打开期间一直保持，并且重新加载或恢复页面仍会保持原来的页面会话。
    * 在新标签或窗口打开一个页面会初始化一个新的会话，这点和 session cookies 的运行方式不同。
    * 应该注意的是，无论是 localStorage 还是 localStorage 中保存的数据都仅限于该页面的协议。
    *
    * 此处的 LocalStorage 设计理念为：
    *   LocalStorage 是针对多个应用的存储，每个应用都有自己独立的存储空间。
    *   使用之前，一个应用请先配置应用的名称(通过配置 `LocalStorage` 模块的 `name` 字段)。
    *   为防止跟别的应用名称冲突，可以加一些随机数，如当前应用名称为 `kis-cloud`，则可以配置为 `kis-cloud-9DCA`。
    *   通过应用的名称来区分每个应用的独立的存储空间。
    *   在每个应用中，又可以创建多个 id 不同的 LocalStorage 的实例，每个 LocalStorage 实例都有自己的存储空间。
    *   每个 LocalStorage 实例中可以储存不同的 key 和 value。
    *   因此，从层级上来说，结构为：web 应用 -> LocalStorage 实例 -> 键值。
    *
    * @class
    * @name LocalStorage
    */
    class LocalStorage {
        /**
        * 构造器。
        *   id: '',         //当前 storage 实例的 id，拥有自己的存储空间。
        *   config = {
        *       name: '',   //必选，应用的名称。
        *   };
        */
        constructor(id, config) {
            config = $Object.deepAssign({}, exports.defaults, config);
    
            let name = config.name;
    
            if (!name) {
                throw new Error(
                    `@definejs/local-storage 是针对多个应用的存储，每个应用都有自己独立的存储空间。
                    请先指定所在应用的名称(通过配置 @definejs/local-storage.defaults 模块的 name 字段) 。`
                );
            }
    
            let meta = {
                'name': name,       //应用名称。
                'id': id,           //
            };
    
            mapper.set(this, meta);
    
        }
    
        /**
        * 设置一对键值。
        * 已重载 set(obj); 批量设置。
        * 已重载 set(key, value); 单个设置。
        * @param {string} key 要进行设置的键名称。
        * @param value 要进行设置的值，可以是任何类型。
        */
        set(key, value) {
            let meta = mapper.get(this);
            let app = Storage.get(meta.name) || {}; //每次都实时从存储中获取。
            let data = app[meta.id] || {};
    
            //重载 set({...}); 批量设置的情况。
            if (typeof key == 'object') {
                Object.assign(data, key);
            }
            else { //单个设置
                data[key] = value;
            }
    
            app[meta.id] = data;
            Storage.set(meta.name, app);
        }
    
        /**
        * 根据给定的键获取关联的值。
        * 已重载 get() 获取全部的情况。
        * @param {string} [key] 要进行获取的键名称。
        * @return 返回该键所关联的值。
        */
        get(key) {
            let meta = mapper.get(this);
            let app = Storage.get(meta.name) || {};   //每次都实时从存储中获取。
            let data = app[meta.id];
    
            if (!data) {
                return;
            }
    
            //重载 get(); 获取全部的情况
            if (arguments.length == 0) {
                return data;
            }
    
            //重载 get(key); 获取指定键的值。
            return data[key];
        }
    
        /**
        * 移除给定的键所关联的项。
        * @param {string} key 要进行移除的键名称。
        */
        remove(key) {
            let meta = mapper.get(this);
            let app = Storage.get(meta.name) || {}; //每次都实时从存储中获取。
            let data = app[meta.id];
    
            if (!data) {
                return;
            }
    
            delete data[key];
    
            Storage.set(meta.name, app);
        }
    
        /**
        * 清空所有项。
        */
        clear() {
            let meta = mapper.get(this);
            let app = Storage.get(meta.name); //每次都实时从存储中获取。
    
            if (!app) {
                return;
            }
    
            delete app[meta.id];
            Storage.set(meta.name, app);
        }
    }
    
    
    LocalStorage.defaults = require('LocalStorage.defaults');
    module.exports = exports = LocalStorage;
});
/**
* src: @definejs/navigator/modules/Navigator/Back.js
* pkg: @definejs/navigator@1.0.0
*/
define('Navigator/Back', function (require, module, exports) { 
    
    
    module.exports = {
        /**
        * 获取指定目标视图相当于当前视图的偏移量。
        */
        getOffset(meta, target) {
            if (!target) {
                return -1;
            }
    
    
            let type = typeof target;
    
            if (type == 'number') {
                if (target < 0) {
                    throw new Error(`要回退的步数(参数 target) 如果指定为数字时，只能是正数。`);
                }
    
                return 0 - (target || 1); //确保为负数。
            }
    
            //此时，把 target 当作一个 string，即目标视图名称。
    
            if (type != 'string') {
                throw new Error(`要回退的目标视图(参数 target) 只能是 number 或 string 类型。`);
            }
    
    
            let info = meta.hash$info[meta.hash]; //当前视图对应的信息。
    
            if (!info) {
                throw new Error(`当前视图为空，无法回退。`);
            }
    
    
            let list = meta.this.get();
            let current = info.view;
            let targetIndex = -1;
            let currentIndex = -1;
    
            list.forEach(function (info, index) {
                let view = info.view;
    
                if (view == target) {
                    targetIndex = index;
                }
    
                if (view == current) {
                    currentIndex = index;
                }
            });
    
    
            if (targetIndex < 0) {
                throw new Error(`历史记录中不存在名为 ${target} 的目标视图。`);
            }
    
    
            let offset = targetIndex - currentIndex;
    
            if (offset == 0) {
                throw new Error(`要回退到的目标视图 ${target} 即为当前视图。`);
            }
    
            if (offset > 0) {
                throw new Error(`要回退到的目标视图 ${target} 在当前视图的后面，应该用前进。`);
            }
    
    
            return offset;
    
    
    
        },
    };
});
/**
* src: @definejs/navigator/modules/Navigator/Hash.js
* pkg: @definejs/navigator@1.0.0
*/
define('Navigator/Hash', function (require, module, exports) { 
    
    const Hash = require('Hash'); //这里用浏览器版本的。
    
    
    module.exports = {
        /**
        * 
        */
        init(meta) {
            let emitter = meta.emitter;
    
    
            //监听窗口 hash 的变化。
            Hash.onchange(window, true, function (hash, old, isImmediate) {
                //
                meta.hash = hash;
    
                //已禁用。
                //此值可给动态改变，因此需要每次都判断。
                if (!meta.enabled) {
                    return;
                }
    
                //此次已临时禁用事件。
                if (!meta.fireEvent) {
                    meta.fireEvent = true; //恢复启用事件，供下次使用。
                    return;
                }
    
    
                if (isImmediate) {
                    emitter.fire('immediate', [hash, meta.hash$info]);
                }
    
                //空值。
                if (!hash) {
                    old = meta.router.toView(old);
                    emitter.fire('none', [old]);
                    return;
                }
    
    
                //通过点击前进/后退按钮(或调用浏览器的前进/后退接口)，
                //或在地址栏中手动输入 hash 导致的变化。
                //此时 hash 值肯定非空(因为如果为空，前面就已拦截了)。
                let target = meta.hash$info[hash];   //可能为空。
                let current = meta.hash$info[old];   //可能为空。
    
                if (target) {
                    let cache = true;
    
                    //优先用指定的。
                    if ('cache' in target) {
                        cache = target.cache;
                        delete target.cache;    //一次性的，用完即删。
                    }
    
                    emitter.fire('view', [target.view, target.args, {
                        'target': target,
                        'current': current,
                        'cache': cache,
                    }]);
    
                    if (current) {
                        let direction = target.timestamp > current.timestamp ? 'forward' : 'back';
    
                        emitter.fire(direction, [current.view, target.view]);
                    }
                    return;
                }
    
    
                hash = meta.router.toView(hash);
                old = meta.router.toView(old);
    
                //说明页面一进来时，地址栏中就含有了 hash。
                if (isImmediate) {
                    emitter.fire('start', [hash, old]);
                }
                else {
                    emitter.fire('404', [hash, old]);
                }
    
            });
        },
    
        /**
        * 
        */
        set(hash) {
            Hash.set(window, hash);
        },
    };
});
/**
* src: @definejs/navigator/modules/Navigator/Infos.js
* pkg: @definejs/navigator@1.0.0
*/
define('Navigator/Infos', function (require, module, exports) { 
    
    
    
    
    //把视图信息按时间先后进行升排序。
    function sort(hash$info) {
    
        let list = Object.keys(hash$info).map(function (hash) {
            return hash$info[hash];
        });
    
    
        list = list.sort(function (a, b) {
            return a.timestamp > b.timestamp ? 1 : -1;
        });
    
        return list;
    
    }
    
    
    
    module.exports = {
        /**
        * 设置视图信息。
        * 会把该视图信息的时间戳更新成最新的。
        */
        set(meta, view, args) {
            let hash = meta.router.toHash(view);
            let hash$info = meta.hash$info;
            let storage = meta.storage;
    
            let now = new Date();
            // var datetime = $Date.stringify(now);
            let timestamp = now.getTime();
    
            let info = hash$info[hash] = {
                'view': view,           //视图名称。
                'hash': hash,           //视图对应的 hash 串。
                // 'datetime': datetime,   //此字段仅为了方便调试和查看。
                'timestamp': timestamp, //时间戳数值。
                'args': args || [],     //渲染视图对应的参数列表。
                //'cache': false,       //这个值会给动态写入，并且很快删除。　这里只是占位，方便阅读。 请不要在此加入该字段。
            };
    
            //重新排序。
            meta.infos = sort(hash$info);
    
    
            if (storage) {
                storage.set('hash$info', hash$info);
            }
    
    
            return info;
    
        },
    
        /**
        * 获取视图信息。
        * 已重载 get();        //获取全部视图信息，返回一个数组，按时间升序排序。
        * 已重载 get(offset);  //获取指定偏移位置的目标视图信息，返回一个对象。
        * 已重载 get(view);    //获取指定视图名称的目标视图信息，返回一个对象。
        * 参数：
        *   view: '',   //目标视图名称。
        *   offset: 0,  //当前视图的偏移量为 0，比当前视图时间更早的，则为负数；否则为正数。
        */
        get(meta, view) {
            let hash$info = meta.hash$info;
    
            //此时为 get(view); 
            //获取指定视图名称的目标视图信息，返回一个对象。
            if (typeof view == 'string') {
                let hash = meta.router.toHash(view);
    
                return hash$info[hash];
            }
    
    
            let offset = view;
            let list = meta.infos;
    
            //此时为 get();
            ///获取全部视图信息，返回一个数组，按时间升序排序。
            if (typeof offset != 'number') {
                return list;
            }
    
    
            //此时为 get(offset);
            //获取指定偏移位置的目标视图信息，返回一个对象。
    
            //当前 hash 对应的视图信息。
            let current = hash$info[meta.hash];
    
            //当前视图信息所在的位置。
            let index = list.findIndex(function (info) {
                return info === current;
            });
    
    
            //要获取的目标视图信息。
            let target = list[index + offset];
    
            return target;
    
        },
    
    };
});
/**
* src: @definejs/navigator/modules/Navigator/Meta.js
* pkg: @definejs/navigator@1.0.0
*/
define('Navigator/Meta', function (require, module, exports) { 
    
    
    
    const id$existed = {}; //根据 id 记录对应的实例是否已创建。 同一个 id 共用同一个 storage 空间。
    
    
    
    
    module.exports = {
        create: function (config, others) {
            var id = config.id;
    
            if (!id) {
                throw new Error(`创建 Navigator 实例时，必须指定 id 字段。`);
            }
    
            if (id$existed[id]) {
                throw new Error(`Navigator 已存在 id 为 ${id} 的实例。`);
            }
    
            id$existed[id] = true;
    
    
    
            var storage = others.storage;
            var hash$info = storage ? storage.get('hash$info') || {} : {};
    
    
    
            var meta = {
                'id': id,                   //实例 id，由业务层传入，确保唯一。
                'hash': '',                 //当前的 hash 值。
                'fireEvent': true,          //指示某一次(时刻)是否需要触发事件。
                'rendered': false,          //记录是否调用过 render()。 
                'enabled': config.enabled,  //是否启用。
    
                'hash$info': hash$info,     //hash 对应的视图信息。
                'infos': [],                //视图信息列表，按时间升排序。
    
                'storage': null,            //持久存储实例。
                'emitter': null,            //事件驱动器。
    
                //hash 与 view 映射转换关系。 
                //默认不进行转换，即 hash 与 view 相同。
                //例如，若要在地址栏 hash 中显示的是 `/user-list.html`，
                //对应的视图却是 `UserList`，则要提供自定义的映射关系。
                'router': null,
    
                'this': null,               //当前实例，方便内部使用。
    
            };
    
    
    
            Object.assign(meta, others);
    
            return meta;
    
        },
    };
});
/**
* src: @definejs/navigator/modules/Navigator/Router.js
* pkg: @definejs/navigator@1.0.0
*/
define('Navigator/Router', function (require, module, exports) { 
    
    
    module.exports = {
    
        create() {
    
            let $exports = {
                //静态映射表。
                //优先级高于动态映射函数的。
                view$hash: {},
                hash$view: {},
    
                //动态映射函数。
                //业务层可提供一个自定义的。
                view2hash: null,
                hash2view: null,
    
    
                //以下两个函数内组件内部使用。
    
                //把 view 转换成 hash。
                //在调用 nav.to() 时进行调用的。
                toHash(view) {
                    let hash = view;
    
                    if (view in $exports.view$hash) {
                        hash = $exports.view$hash[view];
                    }
                    else if (typeof $exports.view2hash == 'function') {
                        hash = $exports.view2hash(view);
                    }
    
                    hash = hash || '';
    
                    if (typeof hash != 'string') {
                        throw new Error('自定义的 view -> hash 的转换关系中，hash 必须为 string 类型。');
                    }
    
                    return hash;
    
                },
    
                //把 hash 转换成 view。
                //在触发 `view` 事件时进行调用的。
                toView(hash) {
                    let view = hash;
    
                    if (hash in $exports.hash$view) {
                        view = $exports.hash$view[hash];
                    }
                    else if (typeof $exports.hash2view == 'function') {
                        view = $exports.hash2view(hash);
                    }
    
                    view = view || '';
    
                    if (typeof view != 'string') {
                        throw new Error('自定义的 hash -> view 的转换关系中，view 必须为 string 类型。');
                    }
    
                    return view;
                },
            };
    
            return $exports;
    
        },
    };
});
/**
* src: @definejs/navigator/modules/Navigator/Storage.js
* pkg: @definejs/navigator@1.0.0
*/
define('Navigator/Storage', function (require, module, exports) { 
    
    
    module.exports = {
        /**
        * 根据配置创建一个 storage 实例。
        *
        *   options = {
        *       Storage: SessionStorage,        //存储的类型，只能是 SessionStorage 或 LocalStorage，否则将不会提供存储功能。
        *       id: '',                         //Navigator 实例的 id。 用于区分不同实例对应的存储空间。
        *   };
        */
        create(options) {
            let Storage = options.Storage;
            let id = options.id;
    
            if (!Storage) {
                return null;
            }
    
    
            let storage = new Storage(id);
    
            return storage;
        },
    };
});
/**
* src: @definejs/navigator/modules/Navigator.defaults.js
* pkg: @definejs/navigator@1.0.0
*/
define('Navigator.defaults', function (require, module, exports) { 
    
    const SessionStorage = require('SessionStorage');
    
    /**
    * Navigator 模块的默认配置
    * @name Navigator.defaults
    */
    module.exports = {
    
        /**
        * 对状态要启用的存储类型。
        * 可取的值有: 
        *   false：禁用存储，页面刷新后将重新开始。
        *   SessionStorage：（默认）会话存储，可以保持页面刷新的状态。
        *   LocalStorage：本地存储，浏览关闭后可以保持页面刷新的状态。 
        */
        Storage: SessionStorage,
    
        /**
        * 实例 id。
        * 须确保每个实例 id 唯一。
        */
        id: '',
    
        /**
        * 是否启用。
        */
        enabled: true,
    
        /**
        * 是否允许在当前激活的视图后面，再添加一个跟当前激活的视图同名的视图进来。
        */
        repeated: false,
    
        /**
        * 是否启用模拟传统多页面的路由转换器。
        * 如果启用，则会把视图名与页面进行双向转换。
        * 如 `AccountUsers` <---> `/account-users.html`。
        */
        simulate: false,
    
    };
    
    
});
/**
* src: @definejs/navigator/modules/Navigator.js
* pkg: @definejs/navigator@1.0.0
*/
define('Navigator', function (require, module, exports) { 
    
    /**
    * 基于浏览器地址栏 hash 的状态导航器。
    * @class
    * @name Navigator
    */
    
    const $String = require('String');
    const Emitter = require('Emitter');
    
    //子模块。
    const Back = module.require('Back');
    const Meta = module.require('Meta');
    const Hash = module.require('Hash');
    const Infos = module.require('Infos');
    const Router = module.require('Router');
    const Storage = module.require('Storage');
    
    
    const mapper = new Map();
    
    
    /**
    * 构造器。
    * 已重载 Navigator(config);
    * 已重载 Navigator(id, config);
    */
    function Navigator(id, config) {
        if (typeof id == 'object') {
            config = id;
        }
        else {
            config = Object.assign({ 'id': id, }, config);
        }
    
    
        config = Object.assign({}, exports.defaults, config);
    
        let emitter = new Emitter(this);
        let router = Router.create();
        let storage = Storage.create(config);
    
    
        let meta = Meta.create(config, {
            'emitter': emitter,
            'router': router,
            'storage': storage,
            'this': this,
        });
    
        mapper.set(this, meta);
    
    
        Object.assign(this, {
            'id': meta.id,
            // '_meta': meta,   //暂时暴露。
        });
    
        //是否启用模拟传统多页面的路由转换器。
        if (config.simulate) {
            this.route(Navigator.simulate);
        }
    }
    
    
    
    Navigator.prototype = {
        constructor: Navigator,
    
        /**
        * 当前实例 id。
        */
        id: '',
    
        /**
        * 渲染。
        * 启用并开始 hash 监听。
        */
        render() {
            var meta = mapper.get(this);
    
            //自动启用。
            this.enable(true);
    
            if (!meta.rendered) {
                Hash.init(meta);
            }
        },
    
        /**
        * 设置 hash 与 view 的路由关系。
        * 即 hash 与 view 之间的映射转换关系。
        *   options = {
        *       静态如果明确指定为 null，则清空之前的。
        *       否则，合并覆盖。
        *       view$hash: {},
        *       hash$view: {},
        *
        *       //视图到 hash 的转换函数。 
        *       //在调用 to() 方法时会先调用此函数。 
        *       //如 `UserList` -> `/user-list.html`。
        *       //该函数会接收到参数: view，传入的视图名，如 `UserList`。 
        *       //该函数应该返回要生成的 hash 值，如 `/user-list.html`。
        *       toHash(view) { },
        *
        *       //hash 到视图的转换函数。 
        *       //在触发某个事件时，会把相应的 hash 作转换，以还原回原来的视图名。 
        *       //如 `/user-list.html` -> `UserList`
        *       //该函数会接收到参数: hash，地址栏中的 hash 值，如 `/user-list.html`。 
        *       //该函数应该返回要还原的视图名，如 `UserList`。
        *       toView(hash) { },
        *   };
        */
        route(options) {
            let meta = mapper.get(this);
            let router = meta.router;
            let view$hash = options.view$hash;
            let hash$view = options.hash$view;
            let toHash = options.toHash;
            let toView = options.toView;
    
            //如果明确指定为 null，则清空之前的。
            //否则，合并覆盖。
            if (hash$view === null) {
                router.hash$view = {};
            }
            else {
                Object.assign(router.hash$view, hash$view);
            }
    
            if (view$hash === null) {
                router.view$hash = {};
            }
            else {
                Object.assign(router.view$hash, view$hash);
            }
    
    
            if (typeof toHash == 'function') {
                router.view2hash = toHash;
            }
    
            if (typeof toView == 'function') {
                router.hash2view = toView;
            }
    
        },
    
        /**
        * 跳转到新视图，并传递一些参数。
        * @return {Object} 返回目标视图信息。
        */
        to(view, ...args) {
            if (typeof view != 'string') {
                throw new Error('参数 name 必须为 string 类型。');
            }
    
    
            let meta = mapper.get(this);
            let emitter = meta.emitter;
            let current = meta.hash$info[meta.hash];    //跳转之前，原来的 hash 对应的视图信息。
            let target = Infos.set(meta, view, args);   //
    
    
            //已禁用。
            if (!meta.enabled) {
                return target;
            }
    
    
            if (target.hash != meta.hash) {
                meta.fireEvent = false;
                Hash.set(target.hash);
            }
    
            let cache = false;
    
            //优先用指定的。
            if ('cache' in target) {
                cache = target.cache;
                delete target.cache;    //一次性的，用完即删。
            }
    
    
            if (current) {
                emitter.fire('to', [current.view, view, {
                    'cache': cache,
                    'current': current,
                    'target': target,
                }]);
            }
    
            //此处的 target 必不为空。
            emitter.fire('view', [view, args, {
                'cache': cache,
                'current': current,
                'target': target,
            }]);
    
            if (current) {
                emitter.fire('forward', [current.view, view]);
            }
    
            return target;
    
        },
    
        /**
        * 后退。
        * 已重载 back();           //只回退一步，且触发事件。
        * 已重载 back(fireEvent);  //只回退一步，且指定是否触发事件。
        * 已重载 back(step);       //回退到指定的步数，且触发事件。
        * 已重载 back(target);     //回退指定的视图，且触发事件。
        * 已重载 back(options);    //更多配置。
        *   options = {
        *       fireEvent: true,    //是否触发事件。
        *       target: 1,          //后退的步数，只能是正数。
        *       target: '',         //后退的目标视图名。
        *
        *       //后退到目标视图，是否要禁用缓存。 
        *       //如果指定为 false，则目标视图会强制刷新。 
        *       //该字段是一次性的，只针对本次后退有效。
        *       cache: false,
        *   };
        */
        back(options) {
            switch (typeof options) {
                case 'boolean':
                    options = { 'fireEvent': options, };
                    break;
    
                case 'number':
                case 'string':
                    options = { 'target': options, };
                    break;
    
                default:
                    options = options || {};
            }
    
            let meta = mapper.get(this);
            let offset = Back.getOffset(meta, options.target);  //为负数。
            let fireEvent = options.fireEvent;
            let cache = options.cache;
            let target = this.get(offset);
    
    
            meta.fireEvent = fireEvent === undefined ? true : !!fireEvent;  //如果未指定，则为 true。
    
            if (target && typeof cache == 'boolean') {
                target.cache = cache;
            }
    
            history.go(offset);
    
            return target;
        },
    
        /**
        * 获取指定的目标视图信息。
        * 已重载 get();        //获取全部视图信息，返回一个数组，按时间升序排序。
        * 已重载 get(offset);  //获取指定偏移位置的目标视图信息，返回一个对象。
        * 已重载 get(view);    //获取指定视图名称的目标视图信息，返回一个对象。
        * 参数：
        *   view: '',   //目标视图名称。
        *   offset: 0,  //当前视图的偏移量为 0，比当前视图时间更早的，则为负数；否则为正数。
        */
        get(view) {
            let meta = mapper.get(this);
            return Infos.get(meta, view);
        },
    
    
        /**
        * 清空缓存和地址栏中的 hash。
        */
        clear() {
            let meta = mapper.get(this);
    
            if (meta.storage) {
                meta.storage.clear();
            }
    
            meta.fireEvent = false;
            meta.hash$info = {};
            Hash.set('');
            meta.fireEvent = true;
    
        },
    
        /**
        * 除了指定的视图信息，其它的全清除。
        */
        reserve(view) {
            let meta = mapper.get(this);
            let hash = meta.router.toHash(view);
            let info = meta.hash$info[hash];
    
            meta.hash$info = {
                [hash]: info,
            };
    
            if (meta.storage) {
                meta.storage.set('hash$info', meta.hash$info);
            }
        },
    
        /**
        * 设置启用或禁用。
        */
        enable(enabled) {
            let meta = mapper.get(this);
            meta.enabled = !!enabled;
        },
    
        /**
        * 绑定事件。
        */
        on(...args) {
            let meta = mapper.get(this);
            meta.emitter.on(...args);
        },
    
    };
    
    
    //静态成员。
    
    Object.assign(Navigator, {
        /**
        * 默认配置。
        */
        defaults: require('Navigator.defaults'),
    
        /**
        * 提供一种常用的模拟传统多页面的路由转换器。
        * 设置 hash 与 view 的双向映射转换关系。
        * 如 `AccountUsers` <-> `/account-users.html`。
        */
        simulate: {
            //把 view 转成 hash。
            toHash(view) {
                if (!view) {
                    return view;
                }
    
                view = $String.toHyphenate(view);   // `AccountUsers` -> `-account-users`。
                view = view.slice(1);               //`-account-users` -> `account-users`。
                view = `/${view}.html`;             //`account-users` -> `/account-users.html`。
    
                return view;
            },
    
            //把 hash 转成 view。
            toView(hash) {
                //确保如 `/xx.html` 的格式。
                if (!(/^\/.+\.html$/).test(hash)) {
                    return hash;
                }
    
                hash = hash.slice(1, -5);
                hash = $String.toCamelCase(hash);
                hash = hash[0].toUpperCase() + hash.slice(1);
    
                return hash;
            },
        },
    
    });
    
    module.exports = exports = Navigator;
    
    
    
    
    
});
/**
* src: @definejs/session-storage/modules/SessionStorage/Storage.js
* pkg: @definejs/session-storage@1.0.0
*/
define('SessionStorage/Storage', function (require, module, exports) { 
    const CircularJSON = require('circular-json');
    
    const storage = window.sessionStorage;
    const key = `@definejs/session-storage`;
    let json = storage.getItem(key) || '{}';        //全部数据的字符串形式。
    let all = CircularJSON.parse(json) || {};       //全部数据的对象形式。  
    
    
    
    //保存到浏览器层面的存储。
    function save() {
        json = CircularJSON.stringify(all);
        storage.setItem(key, json);
    }
    
    
    module.exports = {
        /**
        * 设置一对键值。
        * @param {string} key 要进行设置的键名称。
        * @param value 要进行设置的值，可以是任何类型。
        */
        set(key, value) {
            all[key] = value;
            save();
        },
    
        /**
        * 根据给定的键获取关联的值。
        * @param {string} key 要进行获取的键名称。
        * @return 返回该键所关联的值。
        */
        get(key) {
            return all[key];
        },
    
        /**
        * 移除给定的键所关联的项。
        * @param {string} key 要进行移除的键名称。
        */
        remove(key) {
            delete all[key];
            save();
        },
    
        /**
        * 清空所有项。
        */
        clear() {
            all = {};
            save();
        },
    };
});
/**
* src: @definejs/session-storage/modules/SessionStorage.defaults.js
* pkg: @definejs/session-storage@1.0.0
*/
define('SessionStorage.defaults', function (require, module, exports) { 
    
    /**
    * SessionStorage 模块的默认配置
    * @name SessionStorage.defaults
    */
    module.exports = {
        /**
        * 应用的名称。
        * 设定后即可创建与获取在该名称下的本地存储，从而避免跟其它应用的冲突。
        */
        name: '',
    };
});
/**
* src: @definejs/session-storage/modules/SessionStorage.js
* pkg: @definejs/session-storage@1.0.0
*/
define('SessionStorage', function (require, module, exports) { 
    const $Object = require('Object');
    const Storage = module.require('Storage');
    const mapper = new Map();
    
    /**
    * 会话存储工具类。
    *
    * sessionStorage 属性允许你访问一个 session Storage 对象。
    * 它与 localStorage 相似，不同之处在于 localStorage 里面存储的数据没有过期时间设置，
    * 而存储在 sessionStorage 里面的数据在页面会话结束时会被清除。
    * 页面会话在浏览器打开期间一直保持，并且重新加载或恢复页面仍会保持原来的页面会话。
    * 在新标签或窗口打开一个页面会初始化一个新的会话，这点和 session cookies 的运行方式不同。
    * 应该注意的是，无论是 localStorage 还是 sessionStorage 中保存的数据都仅限于该页面的协议。
    *
    * 此处的 SessionStorage 设计理念为：
    *   SessionStorage 是针对多个应用的存储，每个应用都有自己独立的存储空间。
    *   使用之前，一个应用请先配置应用的名称(通过配置 `SessionStorage` 模块的 `name` 字段)。
    *   为防止跟别的应用名称冲突，可以加一些随机数，如当前应用名称为 `kis-cloud`，则可以配置为 `kis-cloud-9DCA`。
    *   通过应用的名称来区分每个应用的独立的存储空间。
    *   在每个应用中，又可以创建多个 id 不同的 SessionStorage 的实例，每个 SessionStorage 实例都有自己的存储空间。
    *   每个 SessionStorage 实例中可以储存不同的 key 和 value。
    *   因此，从层级上来说，结构为：web 应用 -> SessionStorage 实例 -> 键值。
    *
    * @class
    * @name SessionStorage
    */
    class SessionStorage {
        /**
        * 构造器。
        *   id: '',         //当前 storage 实例的 id，拥有自己的存储空间。
        *   config = {
        *       name: '',   //必选，应用的名称。
        *   };
        */
        constructor(id, config) {
            config = $Object.deepAssign({}, exports.defaults, config);
    
            let name = config.name;
    
            if (!name) {
                throw new Error(
                    `@definejs/session-storage 是针对多个应用的存储，每个应用都有自己独立的存储空间。
                    请先指定所在应用的名称(通过配置 @definejs/session-storage.defaults 模块的 name 字段) 。`
                );
            }
    
            let meta = {
                'name': name,       //应用名称。
                'id': id,           //
            };
    
            mapper.set(this, meta);
    
        }
    
        /**
        * 设置一对键值。
        * 已重载 set(obj); 批量设置。
        * 已重载 set(key, value); 单个设置。
        * @param {string} key 要进行设置的键名称。
        * @param value 要进行设置的值，可以是任何类型。
        */
        set(key, value) {
            let meta = mapper.get(this);
            let app = Storage.get(meta.name) || {}; //每次都实时从存储中获取。
            let data = app[meta.id] || {};
    
            //重载 set({...}); 批量设置的情况。
            if (typeof key == 'object') {
                Object.assign(data, key);
            }
            else { //单个设置
                data[key] = value;
            }
    
            app[meta.id] = data;
            Storage.set(meta.name, app);
        }
    
        /**
        * 根据给定的键获取关联的值。
        * 已重载 get() 获取全部的情况。
        * @param {string} [key] 要进行获取的键名称。
        * @return 返回该键所关联的值。
        */
        get(key) {
            let meta = mapper.get(this);
            let app = Storage.get(meta.name) || {};   //每次都实时从存储中获取。
            let data = app[meta.id];
    
            if (!data) {
                return;
            }
    
            //重载 get(); 获取全部的情况
            if (arguments.length == 0) {
                return data;
            }
    
            //重载 get(key); 获取指定键的值。
            return data[key];
        }
    
        /**
        * 移除给定的键所关联的项。
        * @param {string} key 要进行移除的键名称。
        */
        remove(key) {
            let meta = mapper.get(this);
            let app = Storage.get(meta.name) || {}; //每次都实时从存储中获取。
            let data = app[meta.id];
    
            if (!data) {
                return;
            }
    
            delete data[key];
    
            Storage.set(meta.name, app);
        }
    
        /**
        * 清空所有项。
        */
        clear() {
            let meta = mapper.get(this);
            let app = Storage.get(meta.name); //每次都实时从存储中获取。
    
            if (!app) {
                return;
            }
    
            delete app[meta.id];
            Storage.set(meta.name, app);
        }
    }
    
    SessionStorage.defaults = require('SessionStorage.defaults');
    module.exports = exports = SessionStorage;
});
/**
* src: @definejs/package/modules/Package/All.js
* pkg: @definejs/package@1.0.0
*/
define('Package/All', function (require, module, exports) { 
    
    
    const Url = require('Url');
    const Tasker = require('Tasker');
    const API = require('API');
    const Query = require('Query');
    
    const sid = `@definejs/package.load-all.sid`;
    let all = null; //加载到的总包信息，是一个 json 对象。
    
    //根据配置项生成 `all.json` 文件最终的 url 地址。
    function makeUrl(options) {
        let url = Url.root() + options.url;
        let query = options.query;
    
        if (typeof query == 'string') {
            query = Query.parse(query);
        }
    
        if (query) {
            url = Query.add(url, query);
        }
    
        if (options.random) {
            url = Query.random(url, 4);
        }
    
        return url;
    }
    
    //发起 ajax 请求去加载 all.json 文件。
    function load(options, done) {
        let url = makeUrl(options);
    
        let api = new API({
            'url': url,
            'field': {},    //指定为一个空对象，以把响应解析成 json。
        });
    
        api.on({
            response(status, json, xhr) { 
                all = json || {};
                done && done(all);
            },
        });
    
        api.get();
        
    }
    
    
    
    module.exports = {
        /**
        * 用异步的方式加载总包文件。
        * 即 `packages/all.json` 文件。
        * 该方法会优先使用之前加载过的缓存。
        *   options = {
        *       url: '',
        *       query: {},
        *       random: true,
        *   };
        */
        load(options, done) {
            //已加载过了，直接复用。
            if (all) {
                done && done(all);
                return;
            }
    
            //首次加载，添加到待办列表中。
            Tasker.todo(sid, done, function (finish) {
                load(options, function (all) {
                    finish(function (done) {
                        done && done(all);
                    });
                });
            });
    
    
        },
    };
});
/**
* src: @definejs/package/modules/Package/Loader.js
* pkg: @definejs/package@1.0.0
*/
define('Package/Loader', function (require, module, exports) { 
    
    const API = require('API');
    const Script = require('Script');
    const Tasker = require('Tasker');
    
    var type$load = {
        /**
        * 加载 css 文件。
        *   url: '',        //要加载的文件的 url 地载。
        *   success: fn,    //加载成功后的回调函数。
        */
        css(url, success) {
            let link = document.createElement('link');
    
            link.onerror = function () {
                throw new Error(`css 文件加载失败: ${url}`);
            };
    
            link.onload = function () {
                success && success({
                    'url': url,
                    'content': '', //这里无法也不需要获取内容。
                });
            };
    
            link.rel = 'stylesheet';
            link.href = url;
    
            document.head.appendChild(link);
        },
    
        /**
        * 加载 html 文件。
        *   url: '',        //要加载的文件的 url 地载。
        *   success: fn,    //加载成功后的回调函数。
        */
        html(url, success) {
            let api = new API({
                'url': url,
                'random': false,//不需要加随机数。
                'field': null,  //显式指定为 null，以当成是普通的请求（即非 json 响应）。
            });
    
            api.on({
                success(xhr) { 
                    let content = xhr.responseText;
    
                    success && success({
                        'url': url,
                        'content': content,
                    });
                },
                error(xhr) { 
                    throw new Error('error: ' + xhr.status);
                },
            });
    
            api.get();
           
        },
    
        /**
        * 加载 js 文件。
        *   url: '',        //要加载的文件的 url 地载。
        *   success: fn,    //加载成功后的回调函数。
        */
        js(url, success) {
            Script.load(url, function () { 
                success && success({
                    'url': url,
                    'content': '',
                });
            });
        },
    
        /**
        * 加载 json 文件。
        *   url: '',        //要加载的文件的 url 地载。
        *   done: fn,       //加载成功后的回调函数。
        */
        json(url, done) {
            let api = new API({
                'url': url,
                'field': {},    //指定为一个空对象，以把响应解析成 json。
            });
    
            api.on({
                response(status, json, xhr) {
                    all = json || {};
                    done && done(all);
                },
            });
    
            api.get();
        },
    
    };
    
    
    module.exports = {
        /**
        * 并行加载指定的分包资源文件。
        * @param {Object} type$url 类型对应的资源 url。 如：
        *   {
        *       css: 'packages/items/Home.css',
        *       html: 'packages/items/Home.html',
        *       js: 'packages/items/Home.js',
        *   }
        */
        load(type$url, done) {
            //取出所有的类型。
            //如 ['css', 'html', 'js'];
            let types = Object.keys(type$url); 
            let tasker = new Tasker(types);
    
            tasker.on({
                //针对加载完成某一项。
                each(type, index, done) {
                    let url = type$url[type];
                    let load = type$load[type]; //找到对应的加载器方法。
    
                    if (!load) {
                        throw new Error(`不支持加载 ${type} 类型的文件。`);
                    }
    
                    load(url, function (data) {
                        done({
                            'type': type,
                            'url': data.url,
                            'content': data.content,
                        });
                    });
                },
    
                //全部完成。
                all(items) {
                    let pack = {
                        cache: false,  //指示不是从缓存中读取的。
                    };
    
                    items.forEach(function (item) {
                        pack[item.type] = item;
                    });
    
                    done && done(pack);
                },
            });
    
            //并行加载。
            tasker.parallel();
    
        },
    };
});
/**
* src: @definejs/package/modules/Package.defaults.js
* pkg: @definejs/package@1.0.0
*/
define('Package.defaults', function (require, module, exports) { 
    module.exports = {
        /**
        * 总包的 url 地址，相对于网站的根地址。
        */
        url: 'packages/all.json',
        /**
        * 是否在总包的 url 地址上加上随机 query 串以刷新缓存。
        */
        random: true,
        /**
        * 总包 url 地址的 query 部分，应该由自动化工具写入相应的 MD5 值。
        * 如果指定，则带在 url 的 query 部分。
        */
        query: null,
        /**
        * 加载中的 Loading 实例。  
        * 可选。
        */
        loading: null,
        /**
        * 开始加载时总包或分包时的提示函数。
        * @param {Object} loading 上一次创建出来的 Loading 实例。
        */
        begin(loading) {
            loading && loading.show();
        },
        /**
        * 结束加载时总包或分包时的提示函数。
        * @param {Object} loading 上一次创建出来的 Loading 实例。
        */
        end(loading) {
            loading && loading.hide();
        },
    };
});
/**
* src: @definejs/package/modules/Package.js
* pkg: @definejs/package@1.0.0
*/
define('Package', function (require, module, exports) { 
    
    const Tasker = require('Tasker');
    const All = module.require('All');
    const Loader = module.require('Loader');
    
    const name$pack = {};     //分包名称对应包信息。
    
    
    
    //实际加载函数。
    function load(name, defaults, done) {
        let { begin, end, loading, } = defaults;
    
        //开始异步加载前的提示函数。
        //如可以在提示函数中创建 loading 实例，并 show() 出来。
        begin && begin(loading);
    
    
        //加载总包。
        All.load(defaults, function (name$type$url) {
            let type$url = name$type$url[name]; //该名称对应的分包资源。
    
            //不存在该配置节点。
            if (!type$url) {
                console.warn(`总包  ${defaults.url} 中不存在名为 ${name} 的配置节点。`);
                end && end(loading);   //结束 loading 提示。
                done && done(null);
                return;
            }
    
            //并行加载分包对应的资源文件，如 `css`、`html`、`js`。
            Loader.load(type$url, function (pack) {
                //异步加载结束后的提示函数。
                //如可以在提示函数中 loading.hide() 进行隐藏。
                end && end(loading);
    
                //给外面的回调函数提供一个非缓存版本，以指示是第一次加载的。
                done && done(pack); //里面 pack.cache = false。
            });
    
    
        });
    
    }
    
    
    module.exports = exports = {
        defaults: require('Package.defaults'),
    
        /**
        * 加载指定名称的包资源，并在加载完成后执行一个回调。
        * 对于分包资源的加载，支持同一个分包的多次并发请求，实际只会加载一次。 加载完成后会依次执行回调函数。
        * 已重载 load(done);       //加载总包文件。 此时回调函数接受到的数据结构为总包 json 文件中的结构。
        * 已重载 load(name, done); //加载指定名称的分包资源。
        * @param {string} name 分包的资源名称。
        * @param {function} done 加载完成后要执行的回调函数。
        *   该回调函数会接收到一个包资源的数据对象。
        *   可能会包含一种或多种类型。 
        *   也可能是接收到一个 null(说明不存在该名称对应的包信息)。
        *   该名称对应的包资源存在的情况下，回调函数的接收到参数结构：
        *   done({
        *       cache: true|false,  //指示是否从缓存中读取的。
        *       css: {
        *           type: '',       //资源类型。 如 `css`、`html`、`js`。
        *           url: '',        //资源地址。
        *           content: '',    //资源内容。 css 的为空串。
        *       },
        *       html: {
        *           type: '',       //资源类型
        *           url: '',
        *           content: '',
        *       },
        *       js: {
        *           type: '',       //资源类型
        *           url: '',
        *           content: '',
        *       },
        *   });
        */
        load(name, done) {
            let defaults = exports.defaults;
    
            //重载 load(done); 加载总包文件。
            if (typeof name == 'function') {
                done = name;
                All.load(defaults, done);
                return;
            }
    
    
            //重载 load(name, done); 加载分包的资源。
            let pack = name$pack[name];
    
            //已加载过了，优先使用内存中的缓存。
            //如果为 null，说明已经加载过了但不存在该名称对应的配置节点。
            if (pack || pack === null) {
                done && done(pack);
                return;
            }
    
    
            //支持同一个分包的多次并发请求，实际只会加载一次。 
            //加载完成后会依次执行回调函数。
            let todo = { 'done': done, }; //待办项。
            let sid = `@definejs/package:${name}`;
    
            Tasker.todo(sid, todo, function (finish) {
                load(name, defaults, function (pack) {
                    if (pack) {
                        //保存一个新的缓存版本，供下次直接使用。
                        name$pack[name] = Object.assign({}, pack, {
                            cache: true,
                        });
                    }
                    else {
                        //显式填充一个值，用于下次再加载时直接使用。
                        name$pack[name] = null;
                    }
    
                    finish(function (todo) {
                        todo.done(pack);
                    });
                });
            });
    
        },
    };
});
/**
* src: @definejs/html-parser/modules/HTMLParser.js
* pkg: @definejs/html-parser@1.0.0
*/
define('HTMLParser', function (require, module, exports) { 
    
    /**
    * Parse a string of HTML into an HTML DOM.
    *
    * https://github.com/developit/htmlParser
    */
    module.exports = (function () { 
    
        var exports = {},
            util = {},
            splitAttrsTokenizer = /([a-z0-9_\:\-]*)\s*?=\s*?(['"]?)(.*?)\2\s+/gim,
            domParserTokenizer = /(?:<(\/?)([a-zA-Z][a-zA-Z0-9\:]*)(?:\s([^>]*?))?((?:\s*\/)?)>|(<\!\-\-)([\s\S]*?)(\-\->)|(<\!\[CDATA\[)([\s\S]*?)(\]\]>))/gm;
    
        util.extend = function (a, b) {
            for (var x in b) {
                if (b.hasOwnProperty(x)) {
                    a[x] = b[x];
                }
            }
            return a;
        };
    
        util.inherit = function (a, b) {
            var p = a.prototype;
            function F() {
    
            }
    
            F.prototype = b.prototype;
            a.prototype = new F();
    
            util.extend(a.prototype, p);
            a.prototype.constructor = a;
        };
    
        //by micty。
        //已添加了更多的。
        util.selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'frame', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'object', 'param', 'source'];
    
        util.getElementsByTagName = function (el, tag) {
            var els = [], c = 0, i, n;
            if (!tag) {
                tag = '*';
            }
            tag = tag.toLowerCase();
    
            if (el.childNodes) {
                for (i = 0; i < el.childNodes.length; i++) {
                    n = el.childNodes[i];
                    if (n.nodeType === 1 && (tag === '*' || n.nodeName === tag)) {
                        els[c++] = n;
                    }
    
                    Array.prototype.splice.apply(els, [els.length, 0].concat(util.getElementsByTagName(n, tag)));
                    c = els.length;
                }
            }
    
            return els;
        };
    
        util.splitAttrs = function (str) {
            var obj = {}, token;
    
            if (str) {
                splitAttrsTokenizer.lastIndex = 0;
                str = ' ' + (str || '') + ' ';
    
                while ((token = splitAttrsTokenizer.exec(str))) {
                    obj[token[1]] = token[3];
                }
            }
    
            return obj;
        };
    
        util.ta = document.createElement('textarea');
    
        util.encodeEntities = function (str) {
            util.ta.value = str || '';
            return util.ta.innerHTML;
        };
    
        util.decodeEntities = function (str) {
            util.ta.innerHTML = str || '';
            return util.ta.value;
        };
    
        util.htmlToText = function (html) {
            html = html.replace(/<\/?[a-z].*?>/gim, '');
            return util.decodeEntities(html);
        };
    
        function HTMLElement() {
            this.childNodes = [];
        }
    
        util.extend(HTMLElement.prototype, {
            nodeType: 1,
            textContent: '',
    
            getElementsByTagName: function (tag) {
                return util.getElementsByTagName(this, tag);
            },
    
            getAttribute: function (a) {
                if (this.attributes.hasOwnProperty(a)) {
                    return this.attributes[a];
                }
            },
    
            setAttribute: function (name, value) {
                var lcName = (name + '').toLowerCase();
                this.attributes[name] = value + '';
                if (lcName === 'id' || lcName === 'name') {
                    this[lcName] = value;
                }
                if (lcName === 'class') {
                    this.className = value;
                }
            },
    
            getElementById: function (id) {
                var all = this.getElementsByTagName('*'),
                    i;
                for (i = all.length; i--;) {
                    if (all[i].id === id) {
                        return all[i];
                    }
                }
            },
    
            appendChild: function (child) {
                if (child.parentNode) {
                    child.parentNode.removeChild(child);
                }
                this.childNodes.push(child);
            },
    
            insertBefore: function (child, sibling) {
                if (child.parentNode) {
                    child.parentNode.removeChild(child);
                }
                for (var i = 0; i < this.childNodes.length; i++) {
                    if (this.childNodes[i] === sibling) {
                        break;
                    }
                }
                this.childNodes.splice(i, 0, child);
            },
    
            removeChild: function (child) {
                for (var i = this.childNodes.length; i--;) {
                    if (this.childNodes[i] === child) {
                        this.childNodes.splice(i, 1);
                        break;
                    }
                }
            },
        });
    
        exports.HTMLElement = HTMLElement;
    
    
        function Node() {
    
        }
    
        util.extend(Node.prototype, {
            toString: function () {
                return this.textContent;
            },
        });
    
    
        function Document() {
            HTMLElement.call(this);
        }
    
        util.inherit(Document, HTMLElement);
    
        util.extend(Document.prototype, {
            nodeType: 9,
            nodeName: '#document',
        });
    
        exports.Document = Document;
    
        function TextNode() {
    
        }
    
        util.inherit(TextNode, Node);
    
        util.extend(TextNode.prototype, {
            nodeType: 3,
            nodeName: '#text'
        });
    
    
        exports.TextNode = TextNode;
    
        function CommentNode() {
    
        }
    
        util.inherit(CommentNode, Node);
        util.extend(CommentNode.prototype, {
            nodeType: 8,
            nodeName: '#comment'
        });
    
        exports.CommentNode = CommentNode;
    
    
    
        function CDATASectionNode() { }
    
        util.inherit(CDATASectionNode, Node);
        util.extend(CDATASectionNode.prototype, {
            nodeType: 4,
            nodeName: '#cdata-section'
        });
        exports.CDATASectionNode = CDATASectionNode;
    
    
        util.blockConstructors = {
            '<!--': CommentNode,
            '<![CDATA[': CDATASectionNode
        };
    
    
        /** Parse a string of HTML into an HTML DOM.
         *  @param {String} str		A string containing HTML
         *  @returns {Document}		A Node, the type corresponding to the type of the root HTML node.
         */
        exports.parse = function (str) {
            var tags, doc, parent, prev, token, text, i,
                bStart, bText, bEnd, BlockConstructor, commitTextNode, tag;
            tags = [];
            domParserTokenizer.lastIndex = 0;
    
            parent = doc = new Document();
    
            commitTextNode = function () {
                // note: this is moved out of the loop but still uses its scope!!
                if (parent && tags.length > 0) {
                    prev = tags[tags.length - 1];
                    i = (prev.documentPosition.closeTag || prev.documentPosition.openTag).end;
                    if (prev.parentNode === parent && i && i < tag.documentPosition.openTag.start) {
                        text = str.substring(i, tag.documentPosition.openTag.start);
                        if (text) {
                            text = util.decodeEntities(text);
                            parent.childNodes.push(util.extend(new TextNode(), {
                                textContent: text,
                                nodeValue: text,
                                parentNode: parent
                            }));
                        }
                    }
                }
            };
    
            while ((token = domParserTokenizer.exec(str))) {
                bStart = token[5] || token[8];
                bText = token[6] || token[9];
                bEnd = token[7] || token[10];
                if (bStart === '<!--' || bStart === '<![CDATA[') {
                    i = domParserTokenizer.lastIndex - token[0].length;
                    BlockConstructor = util.blockConstructors[bStart];
                    if (BlockConstructor) {
                        tag = util.extend(new BlockConstructor(), {
                            textContent: bText,
                            nodeValue: bText,
                            parentNode: parent,
                            documentPosition: {
                                openTag: {
                                    start: i,
                                    end: i + bStart.length
                                },
                                closeTag: {
                                    start: domParserTokenizer.lastIndex - bEnd.length,
                                    end: domParserTokenizer.lastIndex
                                }
                            }
                        });
                        commitTextNode();
                        tags.push(tag);
                        tag.parentNode.childNodes.push(tag);
                    }
                }
                else if (token[1] !== '/') {
                    tag = util.extend(new HTMLElement(), {
                        nodeName: (token[2] + '').toLowerCase(),
                        attributes: util.splitAttrs(token[3]),
                        parentNode: parent,
                        documentPosition: {
                            openTag: {
                                start: domParserTokenizer.lastIndex - token[0].length,
                                end: domParserTokenizer.lastIndex
                            }
                        }
                    });
                    tag.className = tag.attributes['class'];
                    tag.id = tag.attributes.id;
                    tag.name = tag.attributes.name;
                    commitTextNode();
                    tags.push(tag);
                    tag.parentNode.childNodes.push(tag);
    
                    //by micty。
                    if ((token[4] && token[4].indexOf('/') > -1) || util.selfClosingTags.includes(tag.nodeName)) {
                        tag.documentPosition.closeTag = tag.documentPosition.openTag;
                        tag.isSelfClosingTag = true;
                        tag.innerHTML = '';
                        tag.outerHTML = str.substring(tag.documentPosition.openTag.start, tag.documentPosition.closeTag.end);
                    }
                    else {
                        parent = tag;
                    }
                }
                else {
                    // Close parent node if end-tag matches
                    if ((token[2] + '').toLowerCase() === parent.nodeName) {
                        tag = parent;
                        parent = tag.parentNode;
                        delete tag.isSelfClosingTag;
                        tag.documentPosition.closeTag = {
                            start: domParserTokenizer.lastIndex - token[0].length,
                            end: domParserTokenizer.lastIndex
                        };
                        tag.innerHTML = str.substring(tag.documentPosition.openTag.end, tag.documentPosition.closeTag.start);
                        tag.outerHTML = str.substring(tag.documentPosition.openTag.start, tag.documentPosition.closeTag.end);
                        tag.textContent = util.htmlToText(tag.innerHTML);
                    }
                    // account for abuse of self-closing tags when an end-tag is also provided:
                    else if ((token[2] + '').toLowerCase() === tags[tags.length - 1].nodeName && tags[tags.length - 1].isSelfClosingTag === true) {
                        tag = tags[tags.length - 1];
                        console.warn('HTML Error: discarding dangling <\/' + token[2] + '> tag. Already closed via: ' + tag.outerHTML);
                        delete tag.isSelfClosing;
                        tag.documentPosition.closeTag = {
                            start: domParserTokenizer.lastIndex - token[0].length,
                            end: domParserTokenizer.lastIndex
                        };
                    }
                    else {
                        console.warn('tag mismatch: "' + token[2] + '" vs "' + tag.nodeName + '"', tag);
                    }
                }
            }
    
            doc.documentElement = doc.getElementsByTagName('html')[0];
            doc.body = doc.getElementsByTagName('body')[0];
    
            return doc;
        };
    
        return exports;
    
    
    })();
});
/**
* src: @definejs/template/modules/Template/Parser/Templates.js
* pkg: @definejs/template@1.0.0
*/
define('Template/Parser/Templates', function (require, module, exports) { 
    /**
    * 获取指定 template 节点的父亲 template 节点(。
    */
    function getParent(tpl) {
        tpl = tpl.parentNode;
    
        while (tpl) {
            if (tpl.nodeName == 'template') {
                return tpl;
            }
    
            tpl = tpl.parentNode;
        }
    
        return null;
    }
    
    
    module.exports = {
        /**
        * 把所有的 template 节点信息提取出来。
        * 返回一个由顶层 template 节点对应的描述信息对象组成的数组。
        */
        get(dom) {
            let tpls = dom.getElementsByTagName('template');
            let tpl$item = new Map();
    
            let list = tpls.map(function (tpl) {
                let attributes = tpl.attributes;
                let innerHTML = tpl.innerHTML;
    
                let item = {
                    'id': tpl.id || '',
                    'name': tpl.name || '',
                    'placeholder': attributes.placeholder || '',
                    'innerHTML': innerHTML,
                    'outerHTML': tpl.outerHTML,
                    'node': tpl,
                    'sample': innerHTML,
                    'parent': null,
                    'attributes': attributes,
                    'items': [],    //直接下级列表。
                };
    
                tpl$item.set(tpl, item);
    
                return item;
            });
    
    
            let roots = list.filter(function (item) {
                let tpl = getParent(item.node);
                let parent = tpl$item.get(tpl);
    
                //收集根节点。
                if (!parent) {
                    return true;
                }
    
                //顺便处理一下其它。
                item.parent = parent;
                parent.items.push(item);
    
                //替换掉子模板在父模板中的内容。
                let sample = parent.sample;
                let outerHTML = item.outerHTML;
                let placeholder = item.placeholder;
    
                if (placeholder) {
                    placeholder = '{' + placeholder + '}';
                }
    
                parent.sample = sample.replace(outerHTML, placeholder);
    
            });
    
            return roots;
        },
    };
    
    
    
});
/**
* src: @definejs/template/modules/Template/Child.js
* pkg: @definejs/template@1.0.0
*/
define('Template/Child', function (require, module, exports) { 
    /**
    * 
    */
    module.exports = {
        /**
        * 根据已解析到的数据节点创建一个子级实例，并设置父子关系等。
        */
        create(Template, meta, item) {
            let name = item.name;
            let sibling = meta.name$tpl[name]; //兄弟节点。
    
            //检测同一级下是否已存在同名的模板。
            if (sibling) {
                throw new Error('同一级下已存在名为 `' + name + '` 的模板。');
            }
    
            let tpl = new Template(item);
    
            meta.name$tpl[name] = tpl;
            meta.parent = meta.this;    //设置父实例，内部使用的。
            tpl.parent = meta.this;     //设置父实例，外部使用的。
    
            tpl.on('process', function (...args) {
                meta.emitter.fire('process', args);
            });
    
            return tpl;
    
        },
    
    
    
    
    };
    
    
    
    
});
/**
* src: @definejs/template/modules/Template/Meta.js
* pkg: @definejs/template@1.0.0
*/
define('Template/Meta', function (require, module, exports) { 
    
    const $String = require('String');
    
    const prefix = 'definejs-template-';    //用于生成组件 id 的前缀部分。
    const suffix = 4;                       //用于生成组件 id 的随机部分的长度。
    
    
    //默认的处理函数。
    function process(data) {
        return data;
    }
    
    
    module.exports = {
        /**
        *
        */
        create(others) {
            let id = $String.randomId(prefix, suffix);
    
            let meta = {
                'id': id,               //
                'sample': '',           //
                'name': '',             //
                'placeholder': '',      //
                'innerHTML': '',        //
                'outerHTML': '',        //
    
                'tpls': [],             //下级实例列表。
                'name$tpl': {},         //命名的下级实例映射，方便按名称读取。
    
                'node': null,           //DOM 节点。
                'parent': null,         //父实例。
                'emitter': null,        //
                'this': null,           //
    
                'process': process,     //默认的处理函数。
            };
    
    
            Object.assign(meta, others);
    
            return meta;
    
        },
    
        /**
        *
        */
        assign(meta, item) {
            Object.assign(meta, {
                'sample': item.sample,
                'name': item.name,
                'placeholder': item.placeholder,
                'innerHTML': item.innerHTML,
                'outerHTML': item.outerHTML,
                'node': item.node,
            });
        },
    
    };
    
    
    
});
/**
* src: @definejs/template/modules/Template/Parser.js
* pkg: @definejs/template@1.0.0
*/
define('Template/Parser', function (require, module, exports) { 
    const HTMLParser = require('HTMLParser');
    const Templates = module.require('Templates');
    
    module.exports = {
        /**
        *
        */
        parse(html) {
            let dom = HTMLParser.parse(html);
            let tpls = Templates.get(dom);
    
            return { dom, tpls, };
        },
    };
    
    
    
});
/**
* src: @definejs/template/modules/Template/Sample.js
* pkg: @definejs/template@1.0.0
*/
define('Template/Sample', function (require, module, exports) { 
    
    
    const $String = require('String');
    
    const script = {
        begin: '<script type="text/template">',
        end: '</script>',
    };
    
    const comment = {
        begin: '<!--',
        end: '-->',
    };
    
    
    
    module.exports = exports = {
        /**
        * 替换掉子模板在父模板中的内容。
        *   sample: 父模板的内容。
        *   item: 解析到的模板数据结构。
        */
        replace(sample, item) {
            let { outerHTML, placeholder, } = item;
    
            if (placeholder) {
                placeholder = '{' + placeholder + '}';
            }
    
            sample = exports.removeScript(sample);
            sample = sample.replace(outerHTML, placeholder); //这里不要用全部替换，否则可能会误及后面的。
    
            return sample;
        },
    
        /**
        * 提取 `<!--` 和 `-->` 之间的内容作为 sample。
        */
        betweenComment(sample) {
            let { begin, end, } = comment;
    
            if (sample.includes(begin) &&
                sample.includes(end)) {
    
                sample = $String.between(sample, begin, end);   //这里用提取。
            }
    
            return sample;
        },
    
        /** 
        * 移除 html 中的 `<script type="text/template">` 和 `</script>` 标签。
        * 如果不存在 script 包裹标签，则原样返回。
        */
        removeScript(html) {
            let { begin, end, } = script;
    
            if (html.includes(begin) &&
                html.includes(end)) {
    
                html = html.split(begin).join('');   //这里用删除。
                html = html.split(end).join('');
            }
    
            return html;
        },
    
    };
    
    
});
/**
* src: @definejs/template/modules/Template.js
* pkg: @definejs/template@1.0.0
*/
define('Template', function (require, module, exports) { 
    
    const $ = require('jquery');
    const $String = require('String');
    const $Object = require('Object');
    const Emitter = require('Emitter');
    const HTMLParser = require('HTMLParser');
    
    const Meta = module.require('Meta');
    const Parser = module.require('Parser');
    const Sample = module.require('Sample');
    const Child = module.require('Child');
    
    const mapper = new Map();
    
    
    class Template {
        /**
        * 构造器。
        * 参数：
        *   selector: '' | DOM | jQuery | {}, //DOM 节点或选择器。 也可以是一个分析到的数据结构对象。
        */
        constructor(selector) {
            //如果传入的是一个纯对象，则认为是内部解析到的数据结构。
            //即要从一个已解析到的数据对象中创建实例。
            let isParsedData = $Object.isPlain(selector);
    
            let meta = Meta.create({
                'emitter': new Emitter(this),
                'this': this,
            });
    
            mapper.set(this, meta);
    
    
            //传入的是一个普通的 DOM 节点或其选择器。
            if (!isParsedData) {
                let node = $(selector).get(0); //包装、拆装，可以让入参多样化。
    
                if (!node) {
                    selector = (selector instanceof $) ? selector.selector : selector;
                    throw new Error('不存在模板节点: ' + selector);
                }
    
                let isTPL = node.nodeName.toLowerCase() == 'template'; //判断是否为 <template> 模板节点。
                let html = Sample.removeScript(node.innerHTML);         //要先移除可能给 `script` 标签包含的内容
                let info = Parser.parse(html);
    
                meta.sample = Sample.betweenComment(html);
                meta.name = isTPL ? node.getAttribute('name') : '';
                meta.placeholder = isTPL ? node.getAttribute('placeholder') : '';
                meta.innerHTML = html;
                meta.outerHTML = node.outerHTML;
                meta.node = node;
    
                meta.tpls = info.tpls.map(function (item) {
                    let tpl = Child.create(Template, meta, item);
                    let sample = meta.sample;
    
                    meta.sample = Sample.replace(sample, item); //替换掉当前模板在父模板中的内容。
    
                    return tpl;
                });
            }
            else {//传入的是一个已解析到的数据对象。
                let item = selector;
    
                Meta.assign(meta, item);
    
                meta.tpls = item.items.map(function (item) {
                    let tpl = Child.create(Template, meta, item);
    
                    return tpl;
                });
            }
    
    
            /**
            * 这里增加个限制：
            * 某一层里只允许出现一个纯 `<template>` 标签，且不允许再嵌套子级 `<template>` 标签。
            * 纯 `<template>` 标签是指无 `name` 和 `placeholder` 属性的 `<template>` 标签。
            * 这段逻辑会把该 template 实例中的 sample 上升为父级实例的 sample 值。
            * 这样可以方便把一级模板用一对 `<template></template>` 标签括起来，等价于直接注释掉当模板的方式，
            * 但比后者多了个语法高亮的优点。 例如：
            *   <ul>
            *       <template>
            *           <li></li>
            *       </temlate>
            *   </ul>
            * 与传统的用注释方式是等价的：
            *   <ul>
            *       <!--
            *       <li></li>
            *       -->
            *   </ul>
            */
            (function () {
                //获取空白名称的直接子级 tpl。
                let tpl = meta.name$tpl[''];
    
                if (!tpl) {
                    return;
                }
    
                //空白名称的直接子级 tpl 对应 meta。
                let tplMeta = mapper.get(tpl);
                let keys = Object.keys(tplMeta.name$tpl);
    
                if (keys.length > 0) {
                    throw new Error('无名称的 template 标签下不能再嵌套子级 template。');
                }
    
                if (tplMeta.placeholder) {
                    throw new Error('无名称的 template 标签不能设置 placeholder 属性。');
                }
    
                //把空白名称的直接子级 tpl 的 sample 当成本级的 sample。
                meta.sample = tplMeta.sample;
    
            })();
    
    
            //对外暴露的属性。
            Object.assign(this, {
                'id': meta.id,
                '_meta': meta, //用于测试。
            });
    
        }
    
        // /**
        // * 当前实例的 id。
        // */
        // id = '';
    
        // /**
        // * 父实例。
        // */
        // parent = null;
    
    
        /**
        * 获取指定名称(或由多个名称组成的路径)节点所对应的下级 Template 实例。
        * 已重载 template(names);                      //传入子模板的名称列表。
        * 已重载 template(name0, name1, ..., nameN);   //依次传入多个子模板的名称。
        */
        template(names) {
            //重载 template(name0, name1, ..., nameN); 
            if (!Array.isArray(names)) {
                names = [...arguments];
            }
    
            //从当前实例开始。
            let tpl = this;
            let meta = mapper.get(tpl);
    
            names.map(function (name) {
                tpl = meta.name$tpl[name];  //取子级的实例。
                meta = mapper.get(tpl);     //子级实例对应的元数据。
            });
    
            return tpl;
        }
    
        /**
        * 获取指定名称(或由多个名称组成的路径)节点所对应的下级 sample 模板。
        */
        sample(...names) {
            let tpl = this.template(...names);
            let meta = mapper.get(tpl);
    
            if (!meta) {
                throw new Error(`当前实例下不存在名称路径为 ${names.join(' ')} 的 Template 子实例。`);
            }
    
            return meta.sample;
        }
    
    
        /**
        * 对当前模板进行填充，并用填充后的 html 字符串渲染容器节点。
        * @param {Object|Array} data 要填充的数据，可以是一个对象或数组。
        * @param {function} process 填充规则的处理器，即处理函数。
        * @return 填充后的 html 内容。
        */
        render(data, process) {
            if (process) {
                this.process(process);
            }
    
            let meta = mapper.get(this);
            let node = meta.node;
            let html = this.fill(data);
    
            if (node) {
                node.innerHTML = html;
            }
    
            return html;
        }
    
        /**
        * 对当前模板及子模板(如果有)进行填充。
        * 已重载 fill(data);
        * 已重载 fill(data, param0, ..., paramN);
        * 已重载 fill(name0, name1, ..., nameN, data);
        * 已重载 fill(name0, name1, ..., nameN, data, param0, ..., paramN);
        * @return {string} 返回填充后的 html 字符串。
        */
        fill(data, ...params) {
            //重载 fill(name0, name1, ..., nameN, data, param0, ..., paramN);
            //即一步到位填充指定路径的子模板。
    
            //全部参数列表。
            let args = [...arguments];
    
    
            //找出 data 在参数列表中所在的位置。
            let index = args.findIndex(function (item) {
                return Array.isArray(item) || $Object.isPlain(item);
            });
    
            //参数列表中没找到任何可用于填充的数据。
            if (index < 0) {
                throw new Error('填充模板时必须指定数据为一个数组或纯对象。');
            }
    
            //找到该数据，但它前面有子模板的名称。
            //使用子模板进行填充。
            if (index > 0) {
                let names = args.slice(0, index);   //子模板名称列表，[name0, name1, ..., nameN];
                let tpl = this.template(...names);
    
                if (!tpl) {
                    throw new Error(`不存在路径为 ${names.join('.')} 的模板节点，请检查 html 模板树。`);
                }
    
                let rest = args.slice(index);   //[data, param0, ..., paramN];
                let html = tpl.fill(...rest);
                return html;
            }
    
    
            //以下情况是直接传入数据进行填充的，不存在传入子模板的情况。
    
            let meta = mapper.get(this);
    
    
            //这里不要缓存 sample，应该实时去获取 meta.sample，
            //因为它可能在 process 函数中给使用者调用了 this.fix() 更改了。
            //var sample = meta.sample; !!!
    
            //单个纯对象形式。
            if (!Array.isArray(data)) {
                meta.emitter.fire('process', args);
    
                //调用处理器获得填充数据。
                //此处特意让处理器函数获得 `this` 执行环境。
                data = meta.process.apply(meta.this, args);
    
                //处理器已直接返回 html 内容，则不需要用模板去填充。
                if (typeof data == 'string') {
                    return data;
                }
    
                let html = $String.format(meta.sample, data);
                return html;
            }
    
            //传进来的是一个数组，则迭代每一项去填充。
            //每一项都会调用处理器函数，并传递一些参数。
            let htmls = data.map(function (item, index) {
                //传给处理器的参数列表。
                //除了传当前迭代的 item 和 index 外，还把 params 也一同传过去。
                //params 就是用户在 fill(data, ...params) 传进来的、data 后面的其它参数。
                //params 用于透传给处理器函数。
                let args = [item, index, ...params];
    
                meta.emitter.fire('process', args);
    
                //调用处理器获得填充数据。
                //此处特意让处理器函数获得 `this` 执行环境。
                let data = meta.process.apply(meta.this, args);
    
                //处理器已直接返回 html 内容，则不需要用模板去填充。
                if (typeof data == 'string') {
                    return data;
                }
    
                if (!data) {
                    return ''; //这里要返回空串。
                }
    
                let html = $String.format(meta.sample, data);
                return html;
            });
    
            return htmls.join('');
        }
    
        /**
        * 设置模板填充的处理规则。
        * 已重载 process(fn);      //设置当前实例的处理器。
        * 已重载 process({...});   //批量设置当前实例以及子实例的处理器。                 
        * 已重载 process(name0, ..., nameN, fn);       //设置路径为 `name0->name1->...->nameN` 的子实例的处理器。
        * 已重载 process(name0, ..., nameN, {...});    //批量设置前缀路径为`name0->name1->...->nameN` 的子实例的处理器。
        */
        process(process) {
            let meta = mapper.get(this);
    
            //重载 process(fn); 
            //设置当前实例的 process 处理函数。
            if (typeof process == 'function') {
                meta.process = process;
                return;
            }
    
    
            let args = [...arguments];
    
            //查找处理器所在的位置。
            let index = args.findIndex(function (item) {
                return typeof item == 'function' || $Object.isPlain(item);
            });
    
            if (index < 0) {
                throw new Error(`模板节点 ${meta.name} 缺少处理器。`);
            }
    
    
            //前面存在前缀名称，则跟后面的处理器合并为一个完整对象，方便后续统一处理。
            //如 process('A', 'B', 'C', process); 则合并为 { A: { B: { C: process } } };
            if (index > 0) {
                let keys = args.slice(0, index);    //如 ['A', 'B', ]
                let item = args[index];             //
    
                process = $Object.make({}, keys, item); //此时 process 是一个 {...}。
            }
    
    
            //展开成扁平结构。
            //如：list = [ { keys: ['A', 'B', 'C'], value: fn, } ];
            let list = $Object.flat(process);
    
            list.forEach(function (item) {
                //去掉空字符串。 因为空串是代表自身。
                let keys = item.keys.filter(function (key) {
                    return !!key;
                });
    
                let value = item.value;
    
                if (typeof value != 'function') {
                    throw new Error(`模板节点 ${keys.join('.')} 的处理器必须为一个函数。`);
                }
    
    
                let tpl = meta.this.template(keys);
    
                if (!tpl) {
                    console.warn(`不存在模板节点: ${keys.join('.')}`);
                    return;
                }
    
                //此时 value 为一个函数。
                tpl.process(value);
    
            });
    
        }
    
        /**
        * 修正模板中指定的占位符。
        * 因为模板中的 html 给 DOM 解析和处理后，没有等号的占位符属性会给替换成有空值的属性值。
        * 如 `<img {test} />` 经过 DOM 解析后会变成 `<img {test}="" />`，这并不是我们想要的结果。
        * 因此我们需要手动修正以替换回我们写模板时的结果。
        */
        fix(keys) {
            let meta = mapper.get(this);
            let sample = meta.sample;
    
            keys = Array.isArray(keys) ? keys : [keys];
    
            keys.map(function (key) {
                let target = '{' + key + '}';
                let old = target + '=""';
    
                sample = sample.split(old).join(target); //replaceAll
            });
    
            meta.sample = sample;
        }
    
        /**
        * 绑定事件。
        */
        on(...args) {
            let meta = mapper.get(this);
            meta.emitter.on(...args);
        }
    
        /**
        * 销毁本组件。
        */
        destroy() {
            let meta = mapper.get(this);
            if (!meta) {
                return;
            }
    
            meta.tpls.map(function (tpl) {
                tpl.destroy();
            });
    
            meta.emitter.destroy();
            meta.node = null;
            meta.parent = null;
            meta.emitter = null;
    
            mapper.delete(this);
    
        }
    
        //静态成员。
        /**
        * 从一段 html 中解析出信息，并创建一个 Template 实例。
        */
        static create(html) {
            html = `<template>${html}</template>`;
    
            let dom = HTMLParser.parse(html);
    
            //if (dom.childNodes.length != 1) {
            //    throw new Error('要解析的 html 最外层只允许(必须)有一个节点。');
            //}
    
            let tpl = new Template(dom.childNodes[0]);
    
            return tpl;
        }
    }
    
    module.exports = Template;
});
/**
* src: @definejs/alert/modules/Alert/Dialog/Height.js
* pkg: @definejs/alert@1.0.0
*/
define('Alert/Dialog/Height', function (require, module, exports) { 
    const $String = require('String');
    
    //根据文本来计算高度，大概值，并不要求很准确。
    function getHeightByLength(text) {
        text = String(text);
    
        let len = $String.getByteLength(text);
        let h = Math.max(len, 125);
        let max = document.documentElement.clientHeight;
    
        if (h >= max * 0.8) {
            h = '80%';
        }
    
    
        return h;
    }
    
    //根据文本来计算高度，大概值，并不要求很准确。
    function getHeightByLines(text) {
        text = String(text);
    
        let lines = text.split('\n');
        let h = lines.length * 25 + 60;
        let max = document.documentElement.clientHeight;
    
        if (h >= max * 0.8) {
            h = '80%';
        }
    
    
        return h;
    }
    
    
    module.exports = {
        /**
        * 根据文本获取对话框的高度。
        */
        get(text) {
            let h0 = getHeightByLength(text);
            let h1 = getHeightByLines(text);
    
            let h = Math.max(h0, h1);
    
    
            //保证取偶数。
            //因为奇数的高度，如 `height: 125px;`，
            //会导致 footer 的 `border-top` 变粗，暂未找到原因。
            if (typeof h == 'number') {
                h = h % 2 == 1 ? h + 1 : h;
            }
    
            return h;
    
        },
    };
});
/**
* src: @definejs/alert/modules/Alert/Dialog.js
* pkg: @definejs/alert@1.0.0
*/
define('Alert/Dialog', function (require, module, exports) { 
    const Height = module.require('Height');
    
    let dialog = null;
    let visible = false;
    let list = [];
    let activeElement = null;   //上次获得焦点的元素。
    let showFrom = 13;          //记录一下是否由于按下回车键导致的显示。
    let defaults = null;        //使用的是父模拟的配置，由父模块传进来。
    
    //创建对话框。
    function create() {
        let config = Object.assign({}, defaults);
        let Dialog = config.Dialog;
    
        let dialog = new Dialog({
            'cssClass': 'definejs-alert',
            'volatile': config.volatile,
            'mask': config.mask,
            'autoClose': config.autoClose,
            'width': config.width,
            'z-index': config['z-index'],
            'buttons': config.buttons,
        });
    
    
    
        dialog.on('button', {
            ok() {
                let fn = dialog.data('fn');
    
                fn && fn();
            },
        });
    
    
        dialog.on({
            show() {
                visible = true;
    
                showFrom = showFrom == 13 ? 'enter' : '';
                activeElement = document.activeElement;
                activeElement.blur();
            },
    
            hide() {
                visible = false;
    
                let item = list.shift();
    
                if (item) {
                    render(item.text, item.fn);
                }
    
                activeElement = null;
                showFrom = '';
            },
        });
    
        //响应回车键。
    
        document.addEventListener('keydown', (event) => { 
            showFrom = event.keyCode;
        });
    
        document.addEventListener('keyup', (event) => { 
            let invalid =
                event.keyCode != 13 ||  //不是回车键。
                !visible ||             //已是隐藏，避免再次触发。
                showFrom == 'enter';    //由于之前按下回车键导致的显示。
    
            if (invalid) {
                return;
            }
    
            dialog.hide();
    
            let fn = dialog.data('fn');
            fn && fn();
        });
    
        return dialog;
    }
    
    
    function render(text, fn) {
        let height = Height.get(text);
    
        dialog = dialog || create();
    
        dialog.data('fn', fn);
    
        dialog.set({
            'content': text,
            'height': height,
        });
    
        dialog.show();
    
    }
    
    
    module.exports = {
        /**
        * 由父模块把默认配置传进来以供本模块使用。
        * @param {Object} defaultsData 父模块的默认配置。
        */
        init(defaultsData) {
            defaults = defaultsData;
        },
    
        /**
        * 把要显示的文本和要执行的回调函数加到队列里，并在特定时机显示出来。
        */
        add(text, fn) {
            //首次显示，或之前显示的已经给隐藏了，立即显示出来。
            if (!visible) {
                render(text, fn);
                return;
            }
    
            //已经是显示的，加到队列里进行排队。
            list.push({ text, fn, });
        },
    };
});
/**
* src: @definejs/alert/modules/Alert/Sample.js
* pkg: @definejs/alert@1.0.0
*/
define('Alert/Sample', function (require, module, exports) { 
    //这里不要在 <pre> 中换行，它是一个保持原格式的标签。
    module.exports = `<pre class="JSON">{text}</pre>`;
});
/**
* src: @definejs/alert/modules/Alert.defaults.js
* pkg: @definejs/alert@1.0.0
*/
define('Alert.defaults', function (require, module, exports) { 
    
    const Dialog = require('Dialog');
    
    
    /**
    * Alert 模块的默认配置
    * @name Alert.defaults
    */
    module.exports = {
        Dialog, //这里提供一个默认的，移动端的会传入一个移动版的 Dialog。
    
        volatile: false,
        mask: true,
        autoClose: true,
        width: 450,
    
        'z-index': 99999,
    
        buttons: [
            { text: '确定', cmd: 'ok', cssClass: 'OK', },
        ],
    };
});
/**
* src: @definejs/alert/modules/Alert.js
* pkg: @definejs/alert@1.0.0
*/
define('Alert', function (require, module, exports) { 
    /**
    * alert 对话框。
    */
    const $String = require('String');
    const Dialog = module.require('Dialog');
    const Sample = module.require('Sample');
    
    
    module.exports = exports = {
        /**
        * 默认配置。
        */
        defaults: require('Alert.defaults'),
        
        /**
        * 显示一个 alert 对话框。 
        * 支持多次调用，会将多次调用加进队列，在显示完上一次后进行下一次的显示。
        */
        show(text, text1, textN, fn) {
            //重载 show(obj); 
            //以方便程序员调试查看 json 对象。
            if (typeof text == 'object') {
                text = JSON.stringify(text, null, 4);
                text = $String.format(Sample, { 'text': text, });
            }
    
            let args = [...arguments];
    
            //在参数列表中找到的第一个函数当作是回调函数，并忽略后面的参数。
            let index = args.findIndex(function (item, index) {
                return typeof item == 'function';
            });
    
            if (index > 0) { //找到回调函数
                fn = args[index];
                args = args.slice(0, index); //回调函数前面的都当作是要显示的文本
            }
            else {
                fn = null;
            }
    
            text = $String.format(...args);
            
            Dialog.init(exports.defaults);
            Dialog.add(text, fn);
        },
    };
    
    
});
/**
* src: @definejs/dialog/modules/Dialog/Template/Sample.js
* pkg: @definejs/dialog@1.0.0
*/
define('Dialog/Template/Sample', function (require, module, exports) { 
    
    module.exports = `
    <div id="{id}" class="definejs-dialog {cssClass}" style="{style} display: none;">
        <template name="header" placeholder="header">
            <header id="{headerId}">
                {title}
            </header>
        </template>
    
        <template name="content" placeholder="content">
            <article id="{articleId}" class="{noHeader} {noFooter}">
                <div id="{contentId}">{content}</div>
            </article>
        </template>
    
        <template name="footer" placeholder="footer">
            <footer id="{footerId}" class="Buttons-{count}">
                <template name="button" placeholder="buttons">
                    <button data-index="{index}" class="{cssClass}" style="{style}">{text}</button>
                </template>
            </footer>
        </template>
    </div>
    `;
    
});
/**
* src: @definejs/dialog/modules/Dialog/Events.js
* pkg: @definejs/dialog@1.0.0
*/
define('Dialog/Events', function (require, module, exports) { 
    const $ = require('jquery');
    
    
    module.exports = {
    
        bind(meta) {
            //监控 masker 层的隐藏。
            if (meta.masker && meta.volatile) {
                meta.masker.on({
                    'show'() {
    
                    },
                    'hide'() {
                        meta.this.hide();
                    },
                });
            }
    
    
            //底部按钮。
            (function () {
                if (!meta.buttons.length) {
                    return;
                }
    
                let $footer = meta.$footer;
                let eventName = meta.eventName;
                let selector = 'button[data-index]';
                let pressed = meta.pressedClass;
    
                //移动端。
                if (eventName == 'touch') {
                    $footer.touch(selector, handler, pressed);
                    return;
                }
    
                //PC 端。
                $footer.on(eventName, selector, handler); //如 on('click', selector);
    
                $footer.on('mousedown', selector, function (event) {
                    $(this).addClass(pressed);
                });
    
                $footer.on('mouseup mouseout', selector, function (event) {
                    $(this).removeClass(pressed);
                });
    
    
                //内部共用的处理器。
                function handler(event) {
                    let button = this;
                    let index = +button.getAttribute('data-index');
                    let item = meta.buttons[index];
                    let cmd = item.cmd || String(index);
                    let fn = item.fn;
    
                    fn && fn(item, index);
    
                    meta.emitter.fire('button', cmd, [item, index]);
                    meta.emitter.fire('button', [item, index]);
    
    
                    // item.autoClose 优先级高于 meta.autoClose。
                    let autoClose = item.autoClose;
    
                    if (autoClose === undefined) {
                        autoClose = meta.autoClose;
                    }
    
                    if (autoClose) {
                        meta.this.hide();
                    }
                }
    
            })();
    
    
    
        },
    };
});
/**
* src: @definejs/dialog/modules/Dialog/Masker.js
* pkg: @definejs/dialog@1.0.0
*/
define('Dialog/Masker', function (require, module, exports) { 
    
    
    
    module.exports = {
    
        create(config) {
            let Masker = config.Masker;
    
            let defaults = {
                'container': config.container,
            };
    
            let options = Masker.normalize(defaults, config.mask); //返回一个 {} 或 null。
    
            if (!options) {
                return null;
            }
    
    
            Object.assign(options, {
                'volatile': config.volatile,
                'z-index': config['z-index'] - 1,
            });
    
    
            let masker = new Masker(options);
    
            return masker;
    
        },
    };
});
/**
* src: @definejs/dialog/modules/Dialog/Meta.js
* pkg: @definejs/dialog@1.0.0
*/
define('Dialog/Meta', function (require, module, exports) { 
    
    const $String = require('String');
    
    const prefix = 'definejs-dialog-';    //用于生成组件 id 的前缀部分。
    const suffix = 4;                 //用于生成组件 id 的随机部分的长度。
    
    
    
    module.exports = {
        create(config, others) {
            let id = $String.randomId(prefix, suffix);
            let buttons = config.buttons || [];
    
    
            buttons = buttons.map(function (item) {
                return item == 'string' ? { 'text': item, } : item;
            });
    
            let meta = {
                'id': id,
                'headerId': $String.randomId(prefix, 'header-', suffix),
                'articleId': $String.randomId(prefix, 'article-', suffix),
                'contentId': $String.randomId(prefix, 'content-', suffix),
                'footerId': $String.randomId(prefix, 'footer-', suffix),
    
                'Masker': config.Masker,            //遮罩层的构造函数。 由外面按需要传入，从而避免内部关联加载。 针对移动端，如果传入了则使用。
                'Scroller': config.Scroller,        //滚动器的构造函数，由外面按需要传入，从而避免内部关联加载。 针对移动端，如果传入了则使用。
                'scrollable': config.scrollable,    //是否需要滚动内容，如果指定为 true，则必须传入 Scroller 构造器。
                'scrollerConfig': config.scroller,
                'eventName': config.eventName,
                'title': config.title,
                'content': config.content,
                'buttons': buttons,
                'z-index': config['z-index'],       //生成透明层时要用到。
                'width': config.width,              //宽度。
                'height': config.height,            //高度。
                'autoClose': config.autoClose,      //点击任何一个按钮后是否自动关闭组件
                'volatile': config.volatile,        //是否易消失。 即点击对话框外的 masker 时自动关闭对话框。
                'cssClass': config.cssClass || '',  //
                'container': config.container,      //
    
                'pressedClass': 'Pressed',  //底部按钮按下去时的样式类名。
                'visible': false,           //记录当前组件是否已显示
                'style': {},                //样式对象。
                'data': {},                 //供 this.data() 方法使用
    
                'scroller': null,           //针对移动端的滚动器。
                'masker': null,             //Masker 的实例，重复使用。
                'emitter': null,            //事件驱动器。
                'this': null,               //当前实例，方便内部使用。
                '$': null,                  //组件最外层的 DOM 节点的 jQuery 实例。
                '$header': null,            //$(headerId)。
                '$content': null,           //$(contentId)。
                '$footer': null,            //$(footerId)。
            };
    
    
    
            Object.assign(meta, others);
    
    
            return meta;
    
    
        },
    };
});
/**
* src: @definejs/dialog/modules/Dialog/Style.js
* pkg: @definejs/dialog@1.0.0
*/
define('Dialog/Style', function (require, module, exports) { 
    const $Object = require('Object');
    const Style = require('Style');
    
    module.exports = {
        /**
        *
        */
        get(config) {
            let obj = $Object.filter(config, ['height', 'width', 'z-index']);
            let style = Style.objectify(config.style);
    
            style = Style.merge(style, obj);
            style = Style.pixelize(style, ['height', 'width',]);
    
            return style;
    
        },
    
    
    };
    
    
});
/**
* src: @definejs/dialog/modules/Dialog/Template.js
* pkg: @definejs/dialog@1.0.0
*/
define('Dialog/Template', function (require, module, exports) { 
    const Template = require('Template');
    const Style = require('Style');
    
    const Sample = module.require('Sample');
    
    const tpl = Template.create(Sample);
    
    
    
    tpl.process({
        '': function (data) {
            let header = this.fill('header', data);
            let content = this.fill('content', data);
            let footer = this.fill('footer', data);
    
            let style = Style.stringify(data.style);
    
            return {
                'id': data.id,
                'cssClass': data.cssClass || '',
                'style': style,
                'header': header,
                'content': content,
                'footer': footer,
            };
        },
    
        'header': function (data) {
            let title = data.title;
    
            if (!title) {
                return '';
            }
    
    
            return {
                'headerId': data.headerId,
                'title': title,
            };
        },
    
        'content': function (data) {
    
            return {
                'articleId': data.articleId,
                'contentId': data.contentId,
                'content': data.content,
                'noHeader': data.title ? '' : 'NoHeader',              //针对无标题时。
                'noFooter': data.buttons.length > 0 ? '' : 'NoFooter', //针对无按钮时。
            };
        },
    
        'footer': {
            '': function (data) {
                let buttons = data.buttons;
                let count = buttons.length;
    
                if (!count) {
                    return '';
                }
    
                buttons = this.fill('button', buttons);
    
                return {
                    'footerId': data.footerId,
                    'count': count,
                    'buttons': buttons,
                };
    
            },
    
            'button': function (item, index) {
                let style = Style.stringify(item.style);
    
                return {
                    'index': index,
                    'text': item.text,
                    'cssClass': item.cssClass || '',
                    'style': style,
    
                };
            },
        },
    
    });
    
    
    module.exports = tpl;
    
});
/**
* src: @definejs/dialog/modules/Dialog.defaults.js
* pkg: @definejs/dialog@1.0.0
*/
define('Dialog.defaults', function (require, module, exports) { 
    const Masker = require('Masker');
    
    /**
    * Dialog 模块的默认配置
    * @name Dialog.defaults
    */
    module.exports = {
        /**
        * 遮罩层的构造函数。
        * 移动端需要在外部加载 Masker 模块后传入。
        */
        Masker, //这里提供一个默认的，以用于 PC 端。 至于移动端的，则需要提供 `@definejs/masker-mobile` 的。
        /**
        * 滚动器的构造函数。
        * 移动端需要在外部加载 Scroller 模块后传入。
        */
        Scroller: null, //这里由移动端提供。
        /**
        * 组件添加到的容器。
        * 默认为 document.body。
        */
        container: 'body',
        /**
        * 是否启用 mask 层。
        */
        mask: true,
        /**
        * 点击按钮后是否自动关闭组件。
        * 可取值为: true|false，默认为 true，即自动关闭。
        */
        autoClose: true,
        /**
        * 指定是否易消失，即点击 mask 层就是否隐藏/移除。
        * 可取值为: true|false，默认为不易消失。
        */
        volatile: false,
        /**
        * 组件的标题文本。
        */
        title: '',
        /**
        * 组件的内容文本。
        */
        content: '',
        /**
        * 点击按钮时需要用到的事件名。
        */
        eventName: 'click',
        /**
        * 组件用到的 css 类名。
        */
        cssClass: '',
        /**
        * 组件的 css 样式 z-index 值。
        */
        'z-index': 1024,
        /**
        * 
        */
        width: 600,
        /**
        * 组件高度。
        * 可以指定为百分比的字符串，或指定具体的数值（单位为像素），
        */
        height: '50%',
        /**
        * 样式集合。
        * 外层里面的同名字段优先级高于里面的。
        */
        style: {},
        /**
        * 按钮数组。
        */
        buttons: [],
        /**
        * 内容区是否可滚动。
        * PC 端用不可滚动。
        */
        scrollable: false,
        /**
        * 针对滚动器 Scroller 的配置。
        */
        scroller: null,
    };
});
/**
* src: @definejs/dialog/modules/Dialog.js
* pkg: @definejs/dialog@1.0.0
*/
define('Dialog', function (require, module, exports) { 
    const $ = require('jquery');
    const $Object = require('Object');
    const Emitter = require('Emitter');
    const Style = module.require('Style');
    const Meta = module.require('Meta');
    const Masker = module.require('Masker');
    const Events = module.require('Events');
    const Template = module.require('Template');
    
    const mapper = new Map();
    
    
    class Dialog {
    
        /**
        * 构造器。
        */
        constructor(config) {
            config = $Object.deepAssign({}, exports.defaults, config);
    
            let emitter = new Emitter(this);        //事件驱动器。
            let style = Style.get(config);          //
            let masker = Masker.create(config);     //
    
            let meta = Meta.create(config, {
                'style': style,         //从配置中过滤出样式成员，并进行规范化处理，style 是一个 {}。
                'emitter': emitter,     //事件驱动器。
                'masker': masker,       //遮罩层实例。
                'this': this,           //当前实例，方便内部使用。
            });
    
    
            mapper.set(this, meta);
    
            //对外暴露的属性。
            Object.assign(this, {
                'id': meta.id,
            });
    
        }
    
        // /**
        // * 当前实例的 id。
        // * 也是最外层的 DOM 节点的 id。
        // */
        // id = '';
    
        // /**
        // * 当前组件最外层的 DOM 节点对应的 jQuery 实例。
        // * 必须在 render 之后才存在。
        // */
        // $ = null;
    
    
        /**
        * 渲染本组件，生成 html 到容器 DOM 节点中。
        * 该方法只需要调用一次。
        * 触发事件: `render`。
        */
        render() {
            let meta = mapper.get(this);
    
            //已经渲染过了。
            if (meta.$) {
                return;
            }
    
    
            let html = Template.fill(meta);
    
            $(meta.container).append(html);
    
            meta.$ = this.$ = $(`#${meta.id}`);
            meta.$header = $(`#${meta.headerId}`);
            meta.$article = $(`#${meta.articleId}`);
            meta.$content = $(`#${meta.contentId}`);
            meta.$footer = $(`#${meta.footerId}`);
    
           
            //指定了可滚动
            if (meta.scrollable) {
                let Scroller = meta.Scroller;
                if (!Scroller) {
                    throw new Error('你已指定了内容区域可滚动，请传入滚动器模块对应的构造函数 Scroller。');
                }
                meta.scroller = new Scroller(meta.$article, meta.scrollerConfig);
                meta.scroller.render();
            }
           
            Events.bind(meta);
    
            meta.emitter.fire('render');
    
        }
    
        /**
        * 显示本组件。
        */
        show() {
            let meta = mapper.get(this);
    
            //已是显示状态。
            if (meta.visible) {
                meta.scroller && meta.scroller.refresh(200);
                return;
            }
    
            if (!meta.$) {
                this.render();
            }
    
    
            meta.$.show();
            meta.visible = true;
            meta.masker && meta.masker.show();
            meta.scroller && meta.scroller.refresh(200);
            meta.emitter.fire('show');
        }
    
        /**
        * 隐藏本组件。
        */
        hide() {
            let meta = mapper.get(this);
    
            //未渲染或已隐藏。
            if (!meta.$ || !meta.visible) {
                return;
            }
    
            meta.$.hide();
            meta.visible = false;
            meta.masker && meta.masker.hide();
            meta.emitter.fire('hide');
    
        }
    
        /**
        * 移除本组件对应的 DOM 节点。
        */
        remove() {
            let meta = mapper.get(this);
    
            if (!meta.$) {
                return;
            }
    
    
            meta.masker && meta.masker.remove();
            meta.layer && meta.layer.remove();
    
            //reset
            let div = meta.$.get(0);
            div.parentNode.removeChild(div);
    
            meta.$.off();
            meta.visible = false;
            meta.masker = null;
            meta.layer = null;
            meta.$ = null;
            meta.$header = null;
            meta.$content = null;
            meta.$footer = null;
    
            meta.emitter.fire('remove');
    
        }
    
        /**
        * 绑定事件。
        */
        on(...args) {
            let meta = mapper.get(this);
            meta.emitter.on(...args);
        }
    
        /**
        * 销毁本组件。
        */
        destroy() {
            let meta = mapper.get(this);
            if (!meta) {
                throw new Error('该实例已给销毁，无法再次调用 destroy 方法。');
            }
    
    
            this.remove();
    
            meta.emitter.destroy();
            meta.scroller && meta.scroller.destroy(); //在 PC 端为 null
    
            mapper.delete(this);
        }
    
        /**
        * 设置指定的属性。
        * 已重载 set({}); //批量设置多个字段。
        * 已重载 set(key, value); //设置单个指定的字段。
        * @param {string} key 要设置的属性的名称。 
        *  目前支持的字段有：'title', 'content', 'height', 'width。
        * @param value 要设置的属性的值，可以是任何类型。
        */
        set(key, value) {
            this.render();
    
    
            let meta = mapper.get(this);
            let scroller = meta.scroller;
            let obj = typeof key == 'object' ? key : { [key]: value, };
    
            $Object.each(obj, function (key, value) {
                switch (key) {
                    case 'title':
                        meta.$header.html(value);
                        break;
    
                    case 'content':
                        meta.$content.html(value);
                        scroller && scroller.refresh(200);
                        break;
    
                    case 'height':
                    case 'width':
                        let obj = {};
    
                        obj[key] = meta[key] = value;
                        obj = Style.get(obj);
    
                        Object.assign(meta.style, obj); //回写
                        meta.$.css(obj);
                        scroller && scroller.refresh(300);
                        break;
    
                    default:
                        throw new Error(`${module.id} 目前不支持设置属性: ${key}`);
                }
    
            });
    
        }
    
        /**
        * 获取或设置自定义数据。 
        * 在跨函数中传递数据时会比较方便。
        * 已重载 data();           //获取全部自定义数据。
        * 已重载 data(key);        //获取指定键的自定义数据。
        * 已重载 data(obj);        //批量设置多个字段的自定义数据。
        * 已重载 data(key, value); //单个设置指定字段的自定义数据。
        * @param {string|Object} key 要获取或设置的数据的名称(键)。
            当指定为一个纯对象 {} 时，则表示批量设置。
            当指定为字符串或可以转为字符串的类型时，则表示获取指定名称的数据。
        * @param value 要设置的数据的值。 只有显式提供该参数，才表示设置。
        * @return 返回获取到的或设置进来的值。
        */
        data(key, value) {
            let meta = mapper.get(this);
            let data = meta.data;
    
            let len = arguments.length;
            if (len == 0) { //获取全部
                return data;
            }
    
            //重载 data(obj); 批量设置
            if ($Object.isPlain(key)) {
                Object.assign(data, key);
                return key;
            }
    
            //get(key)
            if (len == 1) {
                return data[key];
            }
    
            //set(key, value)
            data[key] = value;
    
            return value;
    
        }
    }
    
    Dialog.defaults = require('Dialog.defaults');
    module.exports = exports = Dialog;
});
/**
* src: @definejs/masker/modules/Masker/Meta.js
* pkg: @definejs/masker@1.0.0
*/
define('Masker/Meta', function (require, module, exports) { 
    const $String = require('String');
    
    const prefix = 'definejs-masker-';    //用于生成组件 id 的前缀部分。
    const suffix = 4;                     //用于生成组件 id 的随机部分的长度。
    
    
    module.exports = {
    
        create(config, others) {
            let id = $String.randomId(prefix, suffix);
            let eventName = config.eventName;
            let volatile = config.volatile;
    
            let meta = {
                'id': id,
                'sample': '',
                'eventName': eventName,         //兼容 PC 端和移动端。 PC 端的为 `click`，移动端的为 `touch`。
                'volatile': volatile,           //是否易消失的。 即点击后自动隐藏。
                'container': config.container,  //组件要装入的容器 DOM 节点。
                'duration': config.duration,    //要持续显示的时间，单位是毫秒。
                'fadeIn': config.fadeIn,        //显示时要使用淡入动画的时间。 如果不指定或指定为 0，则禁用淡入动画。
                'fadeOut': config.fadeOut,      //隐藏时要使用淡出动画的时间。 如果不指定或指定为 0，则禁用淡出动画。
                'opacity': config.opacity,      //不透明度。 在淡入淡出时要到进行计算。
    
                'emitter': null,    //事件驱动器。
                'style': null,      //样式对象。
                'this': null,       //当前实例，方便内部使用。
                '$': null,          //组件最外层的 DOM 节点的 jQuery 实例。
    
                bindVolatile(fn) {
                    if (!volatile) {
                        return;
                    }
    
                    if (eventName == 'touch') {
                        meta.$.touch(fn);
                    }
                    else {
                        meta.$.on(eventName, fn);
                    }
                },
            };
    
    
    
            Object.assign(meta, others);
    
            return meta;
    
    
        },
    };
});
/**
* src: @definejs/masker/modules/Masker/Sample.js
* pkg: @definejs/masker@1.0.0
*/
define('Masker/Sample', function (require, module, exports) { 
    
    module.exports = `<div id="{id}" class="definejs-masker" style="{style} display: none;"></div>`;
});
/**
* src: @definejs/masker/modules/Masker/Style.js
* pkg: @definejs/masker@1.0.0
*/
define('Masker/Style', function (require, module, exports) { 
    const $Object = require('Object');
    const Style = require('Style');
    
    /**
    *
    */
    module.exports = {
        /**
        * 从配置对象中过滤出样式成员，并进行规范化处理。
        * 返回一个样式对象 {}。
        */
        get(config) {
            let obj = $Object.filter(config, ['opacity', 'z-index']);
            let style = Style.objectify(config.style);
    
            style = Style.merge(style, obj);
    
            return style;
    
        },
    };
});
/**
* src: @definejs/masker/modules/Masker.defaults.js
* pkg: @definejs/masker@1.0.0
*/
define('Masker.defaults', function (require, module, exports) { 
    
    /**
    * Masker 模块的默认配置
    * @name Masker.defaults
    */
    module.exports = {
        /**
        * 指定是否易消失，即点击 mask 层就是否隐藏/移除。
        * 可取值为: true|false|"hide"|"remove"，默认为 false，即不易消失。
        */
        volatile: false,
        /**
        * 组件添加到的容器。
        */
        container: 'body',
        /**
        * 点击时需要用到的事件名。
        */
        eventName: 'click',
        /**
        * 需要持续显示的毫秒数。
        * 指定为 0 或不指定则表示一直显示。
        */
        duration: 0,
        /**
        * 显示时要使用淡入动画的时间。 
        * 如果不指定或指定为 0，则禁用淡入动画。
        */
        fadeIn: 0,
        /**
        * 隐藏时要使用淡出动画的时间。 
        * 如果不指定或指定为 0，则禁用淡出动画。
        */
        fadeOut: 0,
        /**
        * 组件用到的 css 类名。
        */
        cssClass: '',
        /**
        * 不透明度。
        */
        opacity: 0.5,
        /**
        * 组件的 css 样式 z-index 值。
        */
        'z-index': 1024,
        /**
        * 样式集合。
        * 外层的同名字段优先级高于里面的。
        */
        style: {},
    };
});
/**
* src: @definejs/masker/modules/Masker.js
* pkg: @definejs/masker@1.0.0
*/
define('Masker', function (require, module, exports) { 
    
    const $ = require('jquery');
    const Emitter = require('Emitter');
    const $Object = require('Object');
    const $String = require('String');
    const $Style = require('Style');
    
    const Sample = module.require('Sample');
    const Style = module.require('Style');
    const Meta = module.require('Meta');
    
    
    const mapper = new Map();
    
    
    class Masker {
        /**
        * 构造器。
        */
        constructor(config) {
            config = $Object.deepAssign({}, exports.defaults, config);
    
            let emitter = new Emitter(this);
            let style = Style.get(config);
    
            let meta = Meta.create(config, {
                'sample': Sample,       //相应的 html 模板。
                'style': style,         //从配置中过滤出样式成员，并进行规范化处理，style 是一个 {}。
                'emitter': emitter,     //事件驱动器。
                'this': this,           //当前实例，方便内部使用。
            });
    
    
            mapper.set(this, meta);
    
            //对外暴露的属性。
            Object.assign(this, {
                'id': meta.id,
            });
    
        }
    
    
        // /**
        // * 当前实例的 id。
        // * 也是最外层的 DOM 节点的 id。
        // */
        // id = '';
    
        // /**
        // * 当前组件最外层的 DOM 节点对应的 jQuery 实例。
        // * 必须在 render 之后才存在。
        // */
        // $ = null;
    
        /**
        * 渲染本组件。
        * 该方法会创建 DOM 节点，并且绑定事件，但没有调用 show()。
        * 该方法只需要调用一次。
        * 触发事件: `render`。
        */
        render() {
            let meta = mapper.get(this);
    
            //已经渲染过了。
            if (meta.$) {
                return;
            }
    
    
            //首次渲染
    
            let style = $Style.stringify(meta.style);
    
            let html = $String.format(meta.sample, {
                'id': meta.id,
                'style': style,
            });
    
    
            $(meta.container).append(html);
    
            this.$ = meta.$ = $(`#${meta.id}`);
    
    
            //根据是否指定了易消失来绑定事件，即点击 mask 层就隐藏。
            meta.bindVolatile(function () {
                let ok = meta.this.hide();
    
                //在 hide() 中明确返回 false 的，则取消关闭。
                if (ok === false) {
                    return;
                }
    
                //先备份原来的 opacity
                let opacity = meta.$.css('opacity');
    
                //显示一个完全透明的层 200ms，防止点透。
                //并且禁用事件，避免触发 show 事件。
                meta.$.css('opacity', 0);
                meta.this.show({ quiet: true, });
    
                setTimeout(function () {
                    meta.$.css('opacity', opacity);
                    meta.$.hide();
                }, 200);
            });
    
            meta.emitter.fire('render');
        }
    
        /**
        * 显示遮罩层。
        * 触发事件: `show`。
        *   config = {
        *       quiet: false,   //是否触发 `show` 事件。 该选项仅开放给组件内部使用。
        *       duration: 0,    //要持续显示的时间，单位是毫秒。 如果不指定，则使用创建实例时的配置。
        *       fadeIn: 200,    //可选。 需要淡入的动画时间，如果不指定或为指定为 0，则禁用淡入动画。
        *   };
        */
        show(config) {
            config = config || {};
    
            let meta = mapper.get(this);
            let duration = 'duration' in config ? config.duration : meta.duration;
            let fadeIn = 'fadeIn' in config ? config.fadeIn : meta.fadeIn;
    
    
            //尚未渲染。
            //首次渲染。
            if (!meta.$) {
                this.render();
            }
    
    
            if (duration) {
                setTimeout(function () {
                    meta.this.hide();
                }, duration);
            }
    
    
            if (fadeIn) {
                meta.$.css('opacity', 0);
            }
    
            meta.$.show();
    
            if (fadeIn) {
                meta.$.animate({
                    'opacity': meta.opacity,
                }, fadeIn);
            }
    
            //没有明确指定要使用安静模式，则触发事件。
            if (!config.quiet) {
                meta.emitter.fire('show');
            }
    
        }
    
        /**
        * 隐藏遮罩层。
        * 触发事件: `hide`。
        * 如果在 hide 事件中明确返回 false，则取消隐藏。
        *   config = {
        *       fadeOut: 200,    //可选。 需要淡出的动画时间，如果不指定或为指定为 0，则禁用淡出动画。
        *   };
        */
        hide(config) {
            config = config || {};
    
            let meta = mapper.get(this);
            let fadeOut = 'fadeOut' in config ? config.fadeOut : meta.fadeOut;
    
            //尚未渲染。
            if (!meta.$) {
                return;
            }
    
            let values = meta.emitter.fire('hide');
    
            //明确返回 false 的，则取消关闭。
            if (values.includes(false)) {
                return false;
            }
    
            if (fadeOut) {
                meta.$.animate({
                    'opacity': 0,
                }, fadeOut, function () {
                    meta.$.css('opacity', meta.opacity);
                    meta.$.hide();
                });
            }
            else {
                meta.$.hide();
            }
        }
    
        /**
        * 移除本组件已生成的 DOM 节点。
        * 触发事件: `remove`。
        */
        remove() {
            let meta = mapper.get(this);
    
            //尚未渲染。
            if (!meta.$) {
                return;
            }
    
            let div = meta.$.get(0);
            div.parentNode.removeChild(div);
    
            meta.$.off();
    
            this.$ = meta.$ = null;
            meta.emitter.fire('remove');
        }
    
        /**
        * 绑定事件。
        */
        on(...args) {
            let meta = mapper.get(this);
            meta.emitter.on(...args);
        }
    
        /**
        * 销毁本组件
        */
        destroy() {
            let meta = mapper.get(this);
    
            this.remove();
            meta.emitter.destroy();
    
            mapper.delete(this);
        }
    
    
        /**
        * 把配置参数规格化。
        * 已重载 normalize(0, 0);              //任意一个为数字，则当成透明度。 如果都为数字，则使用后者的。   
        * 已重载 normalize(defaults, false);   //第二个参数显式指定了要禁用 mask，返回 null。
        * 已重载 normalize({}, {});
        */
        static normalize(defaults, config) {
    
            //第二个参数显式指定了要禁用 mask。
            if (config === false) {
                return null;
            }
    
    
            //输入的是数字，则当成是透明度。
            if (typeof defaults == 'number') { //透明度
                defaults = { 'opacity': defaults };
            }
    
            if (typeof config == 'number') { //透明度
                config = { 'opacity': config };
            }
    
    
            let type0 = typeof defaults;
            let type1 = typeof config;
    
            if (type0 == 'object' && type1 == 'object') {
                return Object.assign({}, defaults, config);
            }
    
    
            //显式指定使用 mask。
            //如果 defaults 没有，则显式分配一个。
            if (config === true) {
                return !defaults || type0 != 'object' ? {} : defaults;
            }
    
    
            //未指定，则使用默认配置指定的，有或没有
            if (config === undefined) {
                return type0 == 'object' ? defaults :
                    defaults ? {} : null;
            }
    
            return type1 == 'object' ? config :
                config ? {} : null;
        }
    }
    
    Masker.defaults = require('Masker.defaults');
    module.exports = exports = Masker;
});
/**
* src: @definejs/confirm/modules/Confirm.defaults.js
* pkg: @definejs/confirm@1.0.0
*/
define('Confirm.defaults', function (require, module, exports) { 
    
    
    const Dialog = require('Dialog');
    
    /**
    * Confirm 模块的默认配置。
    * @name Confirm.defaults
    */
    module.exports = {
        Dialog, //移动端的会传入一个移动版的 Dialog。
    
        /**
        * 组件高度。
        * 可以指定为百分比的字符串，或指定具体的数值（单位为像素），
        */
        mask: true,
        height: 140,
        autoClose: true,
        volatile: false,
    
        'z-index': 99999,
    
        buttons: [
            { text: '确定', cmd: 'ok', cssClass: 'OK', },
            { text: '取消', cmd: 'cancel', cssClass: 'Cancel' },
        ],
    };
});
/**
* src: @definejs/confirm/modules/Confirm.js
* pkg: @definejs/confirm@1.0.0
*/
define('Confirm', function (require, module, exports) { 
    /**
    * 简单的 confirm 对话框。
    */
    let dialog = null;
    let visible = false;
    let list = [];
    let activeElement = null;   //上次获得焦点的元素。
    let showFrom = 13;          //记录一下是否由于按下回车键导致的显示。
    
    //创建对话框
    function create() {
        let defaults = exports.defaults;
        let Dialog = defaults.Dialog;
    
        let dialog = new Dialog({
            'cssClass': 'definejs-confirm',
            'volatile': defaults.volatile,
            'mask': defaults.mask,
            'autoClose': defaults.autoClose,
            'height': defaults.height,
            'z-index': defaults['z-index'],
            'buttons': defaults.buttons,
        });
    
        dialog.on('button', {
            ok() {
                let fn = dialog.data('ok');
                fn && fn();
            },
            cancel() {
                let fn = dialog.data('cancel');
                fn && fn();
            },
        });
    
    
    
        dialog.on({
            show() {
                visible = true;
    
                showFrom = showFrom == 13 ? 'enter' : '';
    
                //先暂存之前的焦点元素。
                activeElement = document.activeElement;
                activeElement.blur();
    
                //让 `确定` 按钮获得焦点。
                dialog.$.find('footer button').get(0).focus();
            },
    
            hide() {
                visible = false;
    
                let item = list.shift();
    
                if (item) {
                    render(item);
                }
    
                //恢复之前的焦点元素。
                activeElement && activeElement.focus();
                activeElement = null;
                showFrom = '';
            },
        });
    
        //响应回车键
        document.addEventListener('keydown', (event) => {
            showFrom = event.keyCode;
        });
    
        document.addEventListener('keyup', (event) => {
            let invalid =
                event.keyCode != 13 ||  //不是回车键。
                !visible ||             //已是隐藏，避免再次触发。
                showFrom == 'enter';    //由于之前按下回车键导致的显示。
    
            if (invalid) {
                return;
            }
    
            dialog.hide();
    
            let fn = dialog.data('ok');
            fn && fn();
        });
    
    
    
        return dialog;
    
    }
    
    
    /**
    *   item = {
    *       text: '',
    *       ok: fn,
    *       cancel: fn,
    *       buttons: ['确定', '取消'],
    *   };
    */
    function render(item) {
        dialog = dialog || create();
    
        dialog.data(item);
    
        dialog.set({
            'content': item.text,
        });
    
        dialog.show();
    
        //重新设置按钮的文本。
        let buttons = item.buttons || [];
        let defaults = exports.defaults;
    
        defaults.buttons.forEach(function (item, index) {
            let $btn = dialog.$.find(`button[data-index="${index}"]`);
            let text = buttons[index] || item.text;
    
            $btn.html(text);
        });
    
    }
    
    
    module.exports = exports = {
        /**
        * 默认配置。
        */
        defaults: require('Confirm.defaults'),
    
        /**
        * 显示一个 confirm 对话框。 
        * 支持多次调用，会将多次调用加进队列，在显示完上一次后进行下一次的显示。
        * 已重载 show(opt);   //传入一个配置对象。
        * 已重载 show(text, ok);       //分开传入参数。
        *   opt = {
        *       text: '',        //要显示的消息内容。
        *       ok: fn,         //可选，点击 `确定` 按钮后要执行的回调函数。
        *       cancel: fn,     //可选，点击 `取消` 按钮后要执行的回调函数。
        *       buttons: [],    //按钮数组。
        *   };
        */
        show(text, ok) {
            let item = typeof text == 'object' ? text : { text, ok, };
    
            //首次显示，或之前显示的已经给隐藏了，立即显示出来。
            if (!visible) {
                render(item);
                return;
            }
    
            //已经是显示的，加到队列里进行排队。
            list.push(item);
        },
    };
    
    
    
});
/**
* src: @definejs/loading/modules/Loading/Masker.js
* pkg: @definejs/loading@1.0.0
*/
define('Loading/Masker', function (require, module, exports) { 
    const Masker = require('Masker');
    
    module.exports = {
    
        create(config) {
            let defaults = {
                'container': config.container,
            };
    
            let options = Masker.normalize(defaults, config.mask); //返回一个 {} 或 null。
    
            if (!options) {
                return null;
            }
    
            let masker = new Masker(options);
            let zIndex = config['z-index'] - 1;
    
            masker.on('render', function () {
                masker.$.css({
                    'z-index': zIndex,
                });
            });
    
            return masker;
    
        },
    };
});
/**
* src: @definejs/loading/modules/Loading/Meta.js
* pkg: @definejs/loading@1.0.0
*/
define('Loading/Meta', function (require, module, exports) { 
    
    const $String = require('String');
    
    const prefix = 'definejs-loading-';     //用于生成组件 id 的前缀部分。
    const suffix = 4;                       //用于生成组件 id 的随机部分的长度。
    
    
    module.exports = {
        /**
        * 
        */
        create(config, others) {
            let id = $String.randomId(prefix, suffix);
            let textId = $String.randomId(prefix, 'text-', suffix);
    
    
            let meta = {
                'id': id,
                'textId': textId,
                'text': config.text || '',
                'cssClass': config.cssClass || '',
                'container': config.container,
                'duration': config.duration || 0,
    
                'sample': '',
                'masker': null,             // Masker 的实例，重复使用。
                'style': null,              //样式对象。
                'emitter': null,            //事件驱动器。
                'this': null,               //当前实例，方便内部使用。
                '$': null,                  //组件最外层的 DOM 节点的 jQuery 实例。
                '$text': null,              //$(textId)。
    
            };
    
    
    
    
            Object.assign(meta, others);
    
    
            return meta;
    
    
        },
    };
});
/**
* src: @definejs/loading/modules/Loading/Presettings.js
* pkg: @definejs/loading@1.0.0
*/
define('Loading/Presettings', function (require, module, exports) { 
    
    /**
    * Loading 的预设配置。
    */
    module.exports = {
        fullscreen: {
            cssClass: 'FullScreen',
        },
    
        'scroller.pulldown': {
            sample: 'IOS',
            cssClass: 'SameLine Pulldown',
            text: '加载中...',
    
        },
    
        'scroller.pullup': {
            sample: 'IOS',
            cssClass: 'SameLine Pullup',
            text: '加载中...',
        },
    };
    
    
});
/**
* src: @definejs/loading/modules/Loading/Sample.js
* pkg: @definejs/loading@1.0.0
*/
define('Loading/Sample', function (require, module, exports) { 
    
    
    const name$sample = {
        'IOS': `
            <div id="{id}" class="definejs-loading-ios {cssClass}" >
                <div class="Main">
                    <div class="Item-0"></div>
                    <div class="Item-1"></div>
                    <div class="Item-2"></div>
                    <div class="Item-3"></div>
                    <div class="Item-4"></div>
                    <div class="Item-5"></div>
                    <div class="Item-6"></div>
                    <div class="Item-7"></div>
                    <div class="Item-8"></div>
                    <div class="Item-9"></div>
                    <div class="Item-10"></div>
                    <div class="Item-11"></div>
                </div>
                <span id="{textId}" class="Text">{text}</span>
            </div>
        `,
    };
    
    
    /**
    *
    */
    module.exports = {
        
        get: function (name) {
            return name$sample[name] || '';
        },
    };
    
    
    
    
});
/**
* src: @definejs/loading/modules/Loading/Style.js
* pkg: @definejs/loading@1.0.0
*/
define('Loading/Style', function (require, module, exports) { 
    
    
    const $Object = require('Object');
    const Style = require('Style');
    
    
    
    module.exports = {
        /**
        * 从配置对象中过滤出样式成员，并进行规范化处理。
        * 返回一个样式对象 {}。
        */
        get(config) {
            let obj = $Object.filter(config, ['height', 'width', 'z-index']);
            let style = Style.objectify(config.style);
    
            style = Style.merge(style, obj);
            style = Style.pixelize(style, ['height', 'width',]);
    
            return style;
    
        },
    
    };
});
/**
* src: @definejs/loading/modules/Loading.defaults.js
* pkg: @definejs/loading@1.0.0
*/
define('Loading.defaults', function (require, module, exports) { 
    /**
    * Loading 模块的默认配置
    * @name Loading.defaults
    */
    module.exports = {
        /**
        * 加载中时要显示的文本。
        */
        text: '处理中...',
        /**
        * 是否启用 masker 层。
        */
        mask: false,
        /**
        * 组件用到的 html 模板。
        * 默认为 'IOS'。 业务层不需要关注该字段。
        */
        sample: 'IOS',
        /**
        * 组件添加到的容器。
        */
        container: 'body',
        /**
        * 显示的持续时间(毫秒)。
        * 0 表示一直显示。
        */
        duration: 0,
        /**
        * 组件用到的 css 类名。
        */
        cssClass: '',
        /**
        * 组件的 css 样式 z-index 值。
        * 为了给其它组件计算 `z-index`，此处需要显式提供一个值。
        * 因为仅用 css 中的会比较麻烦。
        */
        'z-index': 1024,
        /**
        * 组件宽度。
        * 可以指定为百分比的字符串，或指定具体的数值（单位为像素），
        */
        width: '',
        /**
        * 组件高度。
        * 可以指定为百分比的字符串，或指定具体的数值（单位为像素），
        */
        height: '',
        /**
        * 样式集合。
        * 外层的同名字段优先级高于里面的。
        */
        style: {},
    };
});
/**
* src: @definejs/loading/modules/Loading.js
* pkg: @definejs/loading@1.0.0
*/
define('Loading', function (require, module, exports) { 
    const $ = require('jquery');
    const $Object = require('Object');
    const $String = require('String');
    const Emitter = require('Emitter');
    
    //子模块
    const Sample = module.require('Sample');
    const Style = module.require('Style');
    const Meta = module.require('Meta');
    const Masker = module.require('Masker');
    const Presettings = module.require('Presettings');
    
    const mapper = new Map();
    
    
    class Loading {
        /**
        * 构造器。
        */
        constructor(options = {}) {
            let presetting = Presettings[options.presetting] || {};     //预设方案。
            let config = $Object.deepAssign({}, exports.defaults, presetting, options);   //合并预设配置。
    
            let emitter = new Emitter(this);        //事件驱动器。
            let sample = Sample.get(config.sample); //加载相应的 HTML 模板。
            let style = Style.get(config);          //从配置中过滤出样式成员，并进行规范化处理，style 是一个 {}。
            let masker = Masker.create(config);     //
    
            let meta = Meta.create(config, {
                'sample': sample,       //相应的 html 模板。
                'style': style,         //从配置中过滤出样式成员，并进行规范化处理，style 是一个 {}。
                'emitter': emitter,     //事件驱动器。
                'masker': masker,       //遮罩层实例。
                'this': this,           //当前实例，方便内部使用。
            });
    
    
            mapper.set(this, meta);
    
            //对外暴露的属性。
            Object.assign(this, {
                'id': meta.id,
            });
    
        }
    
    
        // /**
        // * 当前实例的 id。
        // * 也是最外层的 DOM 节点的 id。
        // */
        // id = '';
    
        // /**
        // * 当前组件最外层的 DOM 节点对应的 jQuery 实例。
        // * 必须在 render 之后才存在。
        // */
        // $ = null;
    
        /**
        * 渲染本组件，生成 html 到容器 DOM 节点中。
        * 该方法只需要调用一次。
        * 触发事件: `render`。
        */
        render() {
            let meta = mapper.get(this);
    
            //已经渲染过了。
            if (meta.$) {
                return;
            }
    
    
            let html = $String.format(meta.sample, {
                'id': meta.id,
                'text': meta.text,
                'textId': meta.textId,
                'cssClass': meta.cssClass,
            });
    
            $(meta.container).append(html);
    
            meta.$ = this.$ = $(`#${meta.id}`);
            meta.$text = $(`#${meta.textId}`);
            meta.$.css(meta.style);
            meta.emitter.fire('render');
    
        }
    
        /**
        * 显示本组件。
        * 已重载 show(text);       //显示指定的文本。
        * 已重载 show(done);       //显示组件，完成后执行回调函数。 要显示的文本以创建实例时指定的为准。
        * 已重载 show(text, done); //显示指定的文本，完成后执行回调函数。
        * 参数：
        *   text: '',       //要显示的文本。
        *   done: fn,       //完成后回调函数。 须在创建实例时指定 `duration` 字段为大于 0 的值才起作用。 
        */
        show(text, done) {
            //重载 show(done); 
            //不传入要显示的文本，以创建实例时指定的 text 为准。
            if (typeof text == 'function') {
                done = text;
                text = undefined;
            }
    
            let meta = mapper.get(this);
            let masker = meta.masker;
            let duration = meta.duration;
    
    
            //首次 render。
            if (!meta.$) {
                this.render();
            }
    
            if (masker) {
                masker.show();
            }
    
            if (typeof text == 'string') {
                meta.text = text;
                meta.$text.html(text);
            }
    
    
            if (duration) {
                setTimeout(function () {
                    meta.this.hide();
                    done && done();
                }, duration);
            }
    
            meta.$.toggleClass('NoText', !meta.text);
            meta.$.show();
            meta.emitter.fire('show');
    
        }
    
        /**
        * 隐藏本组件。
        * 触发事件: `hide`。
        */
        hide() {
            let meta = mapper.get(this);
            let masker = meta.masker;
    
            if (!meta.$) {
                return;
            }
    
            masker && masker.hide();
            meta.$.hide();
            meta.emitter.fire('hide');
        }
    
        /**
        * 移除本组件已生成的 DOM 节点。
        * 触发事件: `remove`。
        */
        remove() {
            let meta = mapper.get(this);
    
            if (!meta.$) {
                return;
            }
    
            let div = meta.$.get(0);
            let masker = meta.masker;
    
            div.parentNode.removeChild(div);
            masker && masker.remove();
    
    
            meta.$.off();
    
            meta.$ = this.$ = null;
            meta.$text = null;
            meta.masker = null;
    
            meta.emitter.fire('remove');
        }
    
        /**
        * 绑定事件。
        */
        on(...args) {
            let meta = mapper.get(this);
            meta.emitter.on(...args);
        }
    
        /**
        * 销毁本组件。
        */
        destroy() {
            let meta = mapper.get(this);
    
            this.remove();
            meta.emitter.destroy();
    
            mapper.remove(this);
        }
    
    }
    
    Loading.defaults = require('Loading.defaults');
    module.exports = exports = Loading;
});
/**
* src: @definejs/panel/modules/Panel/Container.js
* pkg: @definejs/panel@1.0.0
*/
define('Panel/Container', function (require, module, exports) { 
    
    const $String = require('String');
    
    
    module.exports = {
        /**
        * 获取容器对应的选择器。
        */
        get(id, defaults) {
            //如 `[data-panel="/Users/Main"]`。
            let container = $String.format(defaults.container, {
                'id': id,
            });
    
            return container;
        },
    
        /**
        * 设置新的容器。
        */
        set(meta, value) {
            //在 jQuery 3.x 版本，meta.$.selector 为 undefined。
            value = value || meta.$.selector;
    
            //空值，并且确定它是来源于 Panel.define() 创建的。
            //此时可以用回 meta.container，它为 `[data-panel="xx"]` 格式。
            if (!value && meta.module) {
                value = meta.container;
            }
    
            if (!value) {
                throw new Error(`设置 container 时，请给参数 value 提供一个有效的值。`);
            }
    
            meta.container = value;
    
            //先解除绑定旧容器的事件。
            meta.$.off();
    
            //构造新的容器。
            meta.$ = meta.this.$ = $(meta.container);
    
            //同时更新导出对象的 $ 字段。
            if (meta.panel) {
                meta.panel.$ = meta.$;
            }
    
    
    
            //更新容器后，可能会产生两份完全一样的节点。
            //其中有一份完全是作废的，它们不在 DOM 树中。
            //这里检测并清理不在 DOM 树中的孤立节点。
            //重写 jQuery 中的 find 方法。
            let find = meta.$.find.bind(meta.$);
    
            meta.$.find = function (...args) {
                let $items = find(...args);
    
                $items.each(function (index) {
                    let el = this;
    
                    if (!document.documentElement.contains(el)) {
                        el.parentNode.removeChild(el);
                    }
    
                });
    
                //重新获取一次。
                $items = find(...args);
    
                return $items;
            };
    
    
        },
    };
});
/**
* src: @definejs/panel/modules/Panel/Meta.js
* pkg: @definejs/panel@1.0.0
*/
define('Panel/Meta', function (require, module, exports) { 
    const $String = require('String');
    
    const prefix = 'defnejs-panel-';     //用于生成组件 id 的前缀部分。
    const suffix = 4;                 //用于生成组件 id 的随机部分的长度。
    
    module.exports = {
        create(config, others) {
            const id = $String.randomId(prefix, suffix);
    
            const meta = {
                'id': id,               //实例的 id，全局唯一。
                'container': '',        //容器的 DOM 节点(或其对应的选择器)。
                'rendered': false,      //是否已渲染过。
                'renderArgs': [],       //最近一次 render() 时的参数数组，用于 refresh()。
                'show': config.show,    //是否在组件 render() 后自动调用 show() 方法以进行显示。
                'visible': false,       //当前组件是否可见。
    
                'tplContainer': null,   //用于构造 Template 实例即 tpl 时的参数。 默认为当前 panel 实例的 container，但可以指定来改变。
                'module': null,         //如果非空，则是由 Panel.define() 创建的。 此时 container='[data-panel="xx"]' 的形式。
                '$': null,              //当前实例关联的 DOM 节点对应的 jQuery 实例。
                '$emitter': null,       //供外部用的事件管理器。
                'emitter': null,        //内部使用的事件管理器。
                'tpl': null,            //模板填充的 Template 实例。
                'panel': null,          //缓存调用 this.wrap() 后的返回结果。
                'this': null,           //方便内部使用。
            };
    
    
            Object.assign(meta, others);
    
            return meta;
    
        },
    };
});
/**
* src: @definejs/panel/modules/Panel/Params.js
* pkg: @definejs/panel@1.0.0
*/
define('Panel/Params', function (require, module, exports) { 
    var $String = require('String');
    var $Object = require('Object');
    
    module.exports = {
        /**
        * 针对方法 panel.$on() 提供标准化参数的能力，以支持多样化的重载情况。
        * 已重载 $on(name$selector$fn);            //绑定多个(委托)事件到多个元素上。
        * 已重载 $on(name$fn);                     //绑定多个事件到当前元素上。
    
        * 已重载 $on(name, selector$fn);           //绑定单个(委托)事件到多个元素上。
        * 已重载 $on(name, fn);                    //绑定单个事件到当前元素上。
    
        * 已重载 $on(name, sample, selector$fn);   //绑定单个(委托)事件到多个元素上，这些元素的选择器有共同的填充模板。
        * 已重载 $on(name, selector, fn);          //绑定单个(委托)事件到单个元素上。
        */
        normalize(name, sample, selector$fn) {
            let type = typeof name;
    
            //重载 $on(name$selector$fn);
            //重载 $on(name$fn);
            if (type == 'object') {
                return name;
            }
    
            //此时要求 name 必须为一个 string。
            if (type != 'string') {
                throw new Error(`无法识别参数 name 的类型。`);
            }
    
    
            type = typeof sample;
    
            //重载 $on(name, selector$fn); 
            //重载 $on(name, fn);      
            if (type == 'object' || type == 'function') {
                return { [name]: sample, };
            }
    
    
            //此时要求 sample 必须为一个 string。
            if (type != 'string') {
                throw new Error(`无法识别参数 sample 的类型。`);
            }
    
            type = typeof selector$fn;
    
    
            //重载 $on(name, selector, fn);
            if (type == 'function') {
                return {
                    [name]: {
                        [sample]: selector$fn,  //此时 sample 为 selector，而 selector$fn 为 fn。
                    },
                };
            }
    
            //重载 $on(name, sample, selector$fn);
            if (type == 'object') {
                let all = {};
    
                $Object.each(selector$fn, function (selector, fn) {
                    //如填充前的 sample 为 `[data-cmd="{value}"]`，且 selector 为 `print`，
                    //则填充后的 selector 为 `[data-cmd="print"]`。
                    selector = $String.format(sample, {
                        'value': selector,
                    });
    
                    all[selector] = fn;
                });
    
                return {
                    [name]: all,
                };
            }
    
    
            throw new Error(`无法识别参数 selector$fn 的类型。`);
    
        },
    };
    
    
});
/**
* src: @definejs/panel/modules/Panel.defaults.js
* pkg: @definejs/panel@1.0.0
*/
define('Panel.defaults', function (require, module, exports) { 
    
    /**
    * Panel 模块的默认配置
    * @name Panel.defaults
    */
    module.exports = {
        /**
        * 所关联的 DOM 节点容器的选择器模板。
        */
        container: '[data-panel="{id}"]',
        /**
        * 是否在组件 render 后自动调用 show() 方法以进行显示。
        */
        show: true,
    };
});
/**
* src: @definejs/panel/modules/Panel.js
* pkg: @definejs/panel@1.0.0
*/
define('Panel', function (require, module, exports) { 
    const $ = require('jquery');
    const $Object = require('Object');
    const Emitter = require('Emitter');
    const Template = require('Template');
    const AppModule = require('AppModule');
    
    const Container = module.require('Container');
    const Meta = module.require('Meta');
    const Params = module.require('Params');
    
    const mapper = new Map();
    const id$panel = {};                      //
    
    //因为 View 类的原因，这里用 ES5 的构造函数的写法，而不用 ES6 的 class 的写法。
    
    /**
    * 构造器。
    */
    function Panel(container, config) {
        config = $Object.deepAssign({}, exports.defaults, config);
    
        const meta = Meta.create(config, {
            'moudle': null,                 //如果非空，则是由 Panel.define() 创建的，此时 container='[data-panel="XXX"]'。
            'container': container,         //
            'tplContainer': container,      //
            '$emitter': new Emitter(),      //供外部用的事件管理器。
            'emitter': new Emitter(this),   //内部使用的事件管理器。
            '$': $(container),              //当前实例关联的 DOM 节点对应的 jQuery 实例。
            'this': this,                   //方便内部使用。
        });
    
        mapper.set(this, meta);
    
        //对外暴露的属性。
        Object.assign(this, {
            'container': container,
            'id': meta.id,
            '$': meta.$,
        });
    
    }
    
    //实例成员。
    Object.assign(Panel.prototype, {
        /**
        * 构造实例时传入的 container 参数。
        */
        container: '',
    
        /**
        * 当前实例的 id。
        */
        id: '',
    
        /**
        * 当前实例关联的 DOM 节点对应的 jQuery 实例。
        * 即 $(container) 的快捷方式。
        */
        $: null,
    
        /**
        * 当前实例关联的 module 对象。
        * 业务层只有使用 KISP.panel() 或 KISP.view() 创建实例时，此值才存在。
        */
        module: null,
    
    
        /**
        * 渲染。
        * 触发事件:
        *   首次渲染时，首先会触发 `init` 事件，即该事件只会触发一次。
        *   每次渲染时，都会依次触发 `before-render`、`render`、`after-render` 事件。
        */
        render(...args) {
            let meta = mapper.get(this);
            let emitter = meta.emitter;
    
            meta.renderArgs = args; //保存 render 参数，用于 refresh()。
    
            //首次 render。
            if (!meta.rendered) {
                meta.rendered = true;    //要放在此处。
                emitter.fire('init');
            }
    
            emitter.fire('before-render', args);
            emitter.fire('render', args);
    
    
            //指定了要自动显示。
            if (meta.show) {
                this.show();
            }
    
            emitter.fire('after-render', args);
        },
    
        /**
        * 显示本组件。
        * 触发事件: `show`。
        */
        show(...args) {
            let meta = mapper.get(this);
    
            meta.$.show(...args);
            meta.visible = true;
    
            //外面可能会用到事件返回值。
            return meta.emitter.fire('show');
    
        },
    
        /**
        * 隐藏本组件。
        * 触发事件: `hide`。
        */
        hide(...args) {
            let meta = mapper.get(this);
    
            meta.$.hide(...args);
            meta.visible = false;
    
            //外面可能会用到事件返回值。
            return meta.emitter.fire('hide');
        },
    
        /**
        * 切换显示或隐藏本组件。
        */
        toggle(needShow) {
            let meta = mapper.get(this);
    
            //重载 toggle(); 
            //未指定参数，则根据原有状态进行切换。
            if (arguments.length == 0) {
                meta.visible ? this.hide() : this.show();
            }
            else {
                needShow ? this.show() : this.hide();
            }
    
            //返回更改后的可见状态。
            return meta.visible;
        },
    
        /**
        * 设置模板填充的规则，为模板填充进行预处理。
        */
        template(process) {
            let meta = mapper.get(this);
            let tpl = meta.tpl;
    
            if (!tpl) {
                tpl = meta.tpl = new Template(meta.tplContainer);
            }
    
            if (process) {
                tpl.process(...arguments);
            }
    
            //返回给外面，可能要用到。
            //通过 panel.template() 即可取得 tpl。
            return tpl;
        },
    
        /**
        * 对本组件进行模板填充。
        * 触发事件: `fill`。
        * @param {Object|Array} 要填充的数据，可以是对象或数组。
        * @param {function} [fn] 当要填充的数据是一个数组时，需要进行迭代转换的处理函数。
        *   调用该函数，可以把一个数组转换成一个新的数组。
        */
        fill(data, fn) {
            let meta = mapper.get(this);
    
            this.template(); //先确保 meta.tpl 存在。
            meta.tpl.render(data, fn);
    
            //外面可能会用到事件返回值。
            return meta.emitter.fire('fill', [data]);
        },
    
        /**
        * 刷新。
        * 即使用最近一次的渲染参数重新进行渲染。
        * 触发事件: `refresh`。
        */
        refresh() {
            let meta = mapper.get(this);
            let args = meta.renderArgs;
    
            this.render(...args);
    
            //外面可能会用到事件返回值。
            return meta.emitter.fire('refresh', args);
        },
    
        /**
        * 重置。
        * 触发事件: `reset`。
        */
        reset(...args) {
            let meta = mapper.get(this);
    
            //外面可能会用到事件返回值。
            return meta.emitter.fire('reset', args);
        },
    
        /**
        * 关闭。
        * 触发事件: `close`。
        */
        close(...args) {
            let meta = mapper.get(this);
    
            //外面可能会用到事件返回值。
            return meta.emitter.fire('close', args);
        },
    
        /**
        * 获取一个状态，该状态表示本组件是否为显示状态。
        */
        visible() {
            let meta = mapper.get(this);
            return meta.visible;
        },
    
        /**
        * 获取一个状态，该状态表示本组件是否已渲染过。
        */
        rendered() {
            let meta = mapper.get(this);
            return meta.rendered;
        },
    
        /**
        * 触发外部的事件。
        */
        fire(...args) {
            let meta = mapper.get(this);
    
            //外面可能会用到事件返回值。
            return meta.$emitter.fire(...args);
        },
    
        /**
        * 批量绑定(委托)事件到 panel.$ 对象的多个元素上。
        * 该方法可以批量绑定一个或多个不同的(委托)事件到多个元素上。
        * 该方法是以事件为组长、选择器为组员进行绑定的。
        * 已重载 $on(name$selector$fn);            //绑定多个(委托)事件到多个元素上。
        * 已重载 $on(name$fn);                     //绑定多个事件到当前元素上。
        
        * 已重载 $on(name, selector$fn);           //绑定单个(委托)事件到多个元素上。
        * 已重载 $on(name, fn);                    //绑定单个事件到当前元素上。
        
        * 已重载 $on(name, sample, selector$fn);   //绑定单个(委托)事件到多个元素上，这些元素的选择器有共同的填充模板。 此时 sample 中的 `{value}` 会给 selector$fn 中的 selector 填充。
        * 已重载 $on(name, selector, fn);          //绑定单个(委托)事件到单个元素上。
        *   
        *   name: '',           //事件名。 如 `click`。
        *   selector$fn: {      //选择器对应的事件处理器。
        *       '#id-0': fn,    //
        *       '#id-1': fn,    //
        *   },
        *
        * 例如，绑定多个(委托)事件到多个元素上：
        *   $on({
        *       'click': {
        *           '#id-0': fn,
        *           '#id-1': fn,
        *       },
        *       'keyup': {
        *           '#id-0': fn,
        *           '#id-1': fn,
        *       },
        *   });
        * 例如，绑定选择器有共同模板的多个元素：
        *   $on('click', '[data-cmd="{value}"]', {
        *       'print': fn,
        *       'top': fn,
        *   });
        *   等价于：
        *   $on('click', {
        *       '[data-cmd="print"]': fn,
        *       '[data-cmd="top"]': fn,
        *   });
        */
        $on(name, sample, selector$fn) {
            let name$selector$fn = Params.normalize(name, sample, selector$fn);
    
            if (!name$selector$fn) {
                return;
            }
    
            //统一形式后再处理。
            let meta = mapper.get(this);
    
            $Object.each(name$selector$fn, function (name, selector$fn) {
                if (!selector$fn) {
                    return;
                }
    
                //重载 $on(name$fn); 
                //如 $on({ 'click': fn, });
                if (typeof selector$fn == 'function') {
                    meta.$.on(name, selector$fn); //此时的 selector$fn 就是 fn。
                    return;
                }
    
                $Object.each(selector$fn, function (selector, fn) {
                    meta.$.on(name, selector, fn);
                });
            });
        },
    
        /**
        * 对 panel.$ 对象中的多个元素进行多个(委托)事件的绑定。
        * 该方法可以对一个或多个元素批量绑定多个(委托)事件。
        * 该方法是以选择器为组长、事件为组员进行绑定的。
        * 已重载 $bind(selector$name$fn);    //对多个元素绑定多个(委托)事件。
        * 已重载 $bind(selector, name$fn);   //对单个元素上绑定多个(委托)事件。
        *   
        *   selector: '',       //要绑定的元素或其选择器。
        *   name$fn: {          //事件名对应的处理器函数。
        *       'click': fn0,   //
        *       'keyup': fn1,   //
        *   },
        *
        * 例如，对多个元素绑定多个(委托)事件：
        *   $on({
        *       '#id-0': {
        *           'click': fn10,
        *           'keyup': fn11,
        *       },
        *       '#id-1': {
        *           'click': fn20,
        *           'keyup': fn21,
        *       },
        *   });
        */
        $bind(selector, name$fn) {
            let selector$name$fn = null;
    
            if (typeof selector == 'string') {
                //重载 $bind(selector, name$fn);
                //单个元素，多个事件的情况。
                selector$name$fn = { [selector]: name$fn, };
            }
            else if (typeof selector == 'object') {
                //重载 $bind(selector$name$fn);
                //多个元素，多个事件的情况。
                selector$name$fn = selector;
            }
            else {
                throw new Error(`无法识别参数 selector 的类型。`);
            }
    
            if (!selector$name$fn) {
                return;
            }
    
            //统一形式后再处理。
            let meta = mapper.get(this);
    
            $Object.each(selector$name$fn, function (selector, name$fn) {
                if (!name$fn) {
                    return;
                }
    
                $Object.each(name$fn, function (name, fn) {
                    meta.$.on(name, selector, fn);
                });
            });
    
        },
    
    
        /**
        * 包装一个新对象，使其拥有当前 Panel 实例的部分成员和新对象的成员。
        * @param {Object} [obj] 要需要包装的对象。 
            如果不指定，则只包装当前实例对象。
        * @return {Object} 返回一个由当前实例的部分成员和要包装对象的成员组成的新对象。
        * @example
            var panel = KISP.create('Panel');
            var obj = panel.wrap();
            obj.show();
        
            var obj1 = panel.wrap({ a: 100 });
            console.log(obj1.a);
        */
        wrap(obj) {
            let meta = mapper.get(this);
            let panel = meta.panel;
    
            if (panel) {
                return panel;
            }
    
            obj = obj || {};
            panel = meta.panel = {};
    
            let keys = new Set([
                ...Reflect.ownKeys(meta.this),          //当前实例的成员。
                ...Reflect.ownKeys(Panel.prototype),    //原型上的成员。
            ]);
    
            //忽略的成员。
            keys.delete('constructor');
            keys.delete('fire');
            keys.delete('wrap');
    
            keys = [...keys];
    
            //拷贝实例原有的成员，忽略的成员除外。
            keys.forEach((key) => {
                let value = meta.this[key];
    
                //实例方法静态化。
                if (typeof value == 'function') {
                    value = value.bind(meta.this);
                }
    
                panel[key] = value;
            });
    
            let $emitter = meta.$emitter;
    
            //重写事件绑定，让事件绑定到外部的事件管理器上，而不是内部使用的 emitter。
            Object.assign(panel, obj, {
                'on': $emitter.on.bind($emitter),
                'off': $emitter.off.bind($emitter),
            });
    
            return panel;
        },
    
        /**
        * 传播指定模块的事件列表。
        * 用于透传子模块的事件给父级。
        */
        propagate(M, names) {
            let meta = mapper.get(this);
    
            names.forEach(function (name) {
                M.on(name, function (...args) {
                    meta.this.fire(name, args);
                });
            });
        },
    
        /**
        * 设置指定的属性。
        * 已重载 set(obj);         //批量设置。
        * 已重载 set(key, value);  //单个设置。
        * @param {string} key 要设置的属性的名称。 
        *   目前支持的字段有：'show'、'rendered'、'$'、'container'、'visible'、'template'。
        * @param value 要设置的属性的值，可以是任何类型。
        */
        set(key, value) {
            var meta = mapper.get(this);
    
            //重载 set({...}); 
            //批量设置的情况。
            if ($Object.isPlain(key)) {
                $Object.each(key, function (key, value) {
                    meta.this.set(key, value);
                });
                return;
            }
    
            //重载 set(key, value); 单个设置的情况。
            switch (key) {
                case 'show':
    
                //提供一个重置的机会，以便可以再次触发 init。 
                //这是高级用法，针对特殊场景。
                //场景：在 set('$') 更新容器后，原 `init` 事件中绑定的逻辑，如果用到了 panel.$.on() 之类的，则会失效。
                //因此在 set('$') 后再调一下 set('rendered', false)，可以让 `init` 事件有机会再次触发。
                case 'rendered':
                    meta[key] = value;
                    break;
    
                //更新容器。
                case '$':
                case 'container':
                    Container.set(meta, value);
                    break;
    
                //允许设置可见性的初始状态，以便在不调用 render() 的前提下直接调用 show() 或 hide()。
                case 'visible':
                    meta.visible = !!value;
                    break;
    
                //设置新的模板容器，这样可以把指定的子部分当成模板进行填充，而不影响其它部分。
                case 'template':
                    if (meta.tpl) {
                        throw new Error(`当前实例中已创建了模板实例，无法再修改模板实例所关联的 DOM 容器。`);
                    }
    
                    meta.tplContainer = meta.$.find(value);
                    break;
                default:
                    throw new Error(`目前不支持设置属性: ${key}`);
            }
    
        },
    
        /**
        * 销毁本组件。
        */
        destroy() {
            let meta = mapper.get(this);
            meta.emitter.destroy();
            meta.$emitter.destroy();
            meta.$.off();
    
            mapper.delete(this);
        },
    
        /**
        * 绑定事件到内部的事件管理器。
        * 注意，该方法在通过 wrap() 导出后，会给重写。
        */
        on(...args) {
            let meta = mapper.get(this);
            meta.emitter.on(...args);
        },
    });
    
    //静态成员。
    Object.assign(Panel, {
        defaults: require('Panel.defaults'),
        
        /**
        * 提供一种按标准方法定义面板的方式。
        * 参数 options 是留给内部模块 View 扩展使用的。
        *   options = {
        *       constructor: Panel, //要使用的构造器，Panel 或 View。
        *       defaults: {},       //要使用的默认配置，为 Panel 或 View 对应的配置。
        *   };
        */
        define(id, factory, options) {
            options = options || {
                'constructor': Panel,
                'defaults': exports.defaults,
            };
    
    
            AppModule.define(id, function ($require, $module, $exports) {
                id = $module.id;    //此 id 才是完整的 id。 外面的那个可能是个模板 id。
    
                let container = Container.get(id, options.defaults);    //如 `[data-panel="/Users/Main"]`。
                let panel = new options.constructor(container);         //如 new Panel(`[data-panel="/Users/Main"]`)。
                let meta = mapper.get(panel);                           //获取 panel 对应的元数据。
    
                //指示此 panel 由 Panel.define() 创建的。
                meta.module = panel.module = $module;
    
                //注意，参数中的 factory 并不是真正的工厂函数，本函数体才是。
                //因此，参数中的 factory 的返回值 $exports 只是一个部分的导出对象。 
                $exports = factory($require, $module, panel);
    
                //把部分的导出对象跟 panel 实例合并成一个新的导出对象，
                //让新的导出对象拥有 panel 实例的大部分成员，以及 factory 中导出的成员。
                $exports = panel.wrap($exports);
    
                id$panel[id] = panel;
    
                //业务层拿到的是 $module.exports === $exports。
                //在 factory 函数体内，panel !== $module.exports，它们是包装前与后的关系。
                return $exports;
            });
    
        },
    
        /**
        * 更新容器。
        * 已重载 update(id);   //更新单个。
        * 已重载 update(ids);  //更新多个。
        * 参数 options 是留给内部模块 View 扩展使用的。
        */
        update(ids, options) {
            ids = Array.isArray(ids) ? ids : [ids];
    
            options = options || {
                'defaults': exports.defaults,
            };
    
            ids.forEach(function (id) {
                let panel = id$panel[id];
                let container = Container.get(id, options.defaults);  //如 `[data-panel="/Users/Main"]`。
    
                if (!panel) {
                    console.warn(`不存在 ${container} 的 Panel 实例。`);
                    return;
                }
    
                panel.set('container', container);
            });
        },
    });
    
    module.exports = exports = Panel;
});
/**
* src: @definejs/tabs/modules/Tabs/Events.js
* pkg: @definejs/tabs@1.0.0
*/
define('Tabs/Events', function (require, module, exports) { 
    const $ = require('jquery');
    
    module.exports = {
        /**
        * 
        */
        bind(meta) {
            let { eventName, selector, pressedClass, } = meta;
    
            meta.change = function (event) {
                let target = this;
    
                //每次都重新获取列表。
                //因为可能会动态添加或删除了子节点。
                let items = meta.$.find(selector).toArray();
    
                let index = items.findIndex(function (item) {
                    return item === target;
                });
    
                meta.this.active(index, { event, });
            };
    
            //针对移动端的。
            if (eventName == 'touch') { //特殊处理
                meta.$.touch(selector, meta.change, pressedClass);
                return;
            }
    
    
            //针对 PC 端的。
            meta.$.on(eventName, selector, meta.change);
    
            meta.$.on('mousedown', selector, function (event) {
                $(this).addClass(pressedClass);
            });
    
            meta.$.on('mouseup mouseout', selector, function (event) {
                $(this).removeClass(pressedClass);
            });
        },
    
    };
    
    
    
});
/**
* src: @definejs/tabs/modules/Tabs/Meta.js
* pkg: @definejs/tabs@1.0.0
*/
define('Tabs/Meta', function (require, module, exports) { 
    
    const $String = require('String');
    
    const prefix = 'definejs-tabs-';    //用于生成组件 id 的前缀部分。
    const suffix = 4;                   //用于生成组件 id 的随机部分的长度。
    
    
    
    module.exports = {
        create(config, others) {
            let id = $String.randomId(prefix, suffix);
    
            let meta = {
                'id': id,
                'activedClass': config.activedClass || '',  //激活时的 item 的样式类名。
                'pressedClass': config.pressedClass || '',  //按下时的 item 的样式类名。
                'eventName': config.eventName || '',        //
                'selector': config.selector || '',          //子项的选择器。
                'repeated': !!config.repeated,              //是否允许重复激活。
                'list': config.list || [],                  //fill() 时对应的列表数据。
    
    
                //当前激活的信息。
                current: {
                    index: -1,
                    item: null,     //list[index];
                    event: null,
                    $: null,
                },
    
                'container': null,      //
                'tpl': null,            //
                'emitter': null,        //事件驱动器。
                'this': null,           //当前实例，方便内部使用。
                '$': null,              //组件最外层的 DOM 节点的 jQuery 实例。
                'change': null,         //change 事件处理函数。 如果非空，则说明已绑定。
    
                reset() {
                    meta.$.find(meta.selector).removeClass(meta.activedClass);
    
                    meta.current = {
                        index: -1,
                        item: null,     //list[index];
                        event: null,
                        $: null,
                    };
                },
    
                //在 acitve 过程中要执行的回调函数。 
                //业务层可传入此函数以实现页签激活的动画过渡效果。
                //若提供此函数，则必须手动调用一下参数中传入的 done() 回调函数，以通知本组件进行后续处理。
                activing(info, done) {
                    done();
                },
            };
    
    
    
    
            Object.assign(meta, others);
    
    
            return meta;
    
    
        },
    };
});
/**
* src: @definejs/tabs/modules/Tabs.defaults.js
* pkg: @definejs/tabs@1.0.0
*/
define('Tabs.defaults', function (require, module, exports) { 
    /**
    * Tabs 模块的默认配置。
    * @name Tabs.defaults
    */
    module.exports = {
        /**
        * 创建实例后首先给激的项。
        */
        current: null,
        /**
        * 按下去时的样式的 css 类名。
        */
        pressedClass: '',
        /**
        * 项目给激活时的样式的 css 类名。
        */
        activedClass: '',
        /**
        * 要监听的事件名。
        */
        eventName: 'click',
        /**
        * 取得项目列表所需要用到的选择器。
        * 默认取全部直接子节点。
        */
        selector: '>*',
        /**
        * 是否允许重复激活相同的项。
        * 当指定为 true 时，方响应已给激活的项目的重新点击。
        */
        repeated: false,
    };
    
    
});
/**
* src: @definejs/tabs/modules/Tabs.js
* pkg: @definejs/tabs@1.0.0
*/
define('Tabs', function (require, module, exports) { 
    const $ = require('jquery');
    const $Object = require('Object');
    const Emitter = require('Emitter');
    const Template = require('Template');
    const Events = module.require('Events');
    const Meta = module.require('Meta');
    
    const mapper = new Map();
    
    /**
    * 构造器。
    * 已重载 Tabs(config); //传入一个配置对象。
    * 已重载 Tabs(container, config); //容器从配置对象中分离出来。
    * @constructor
    */
    function Tabs(container, config) {
        //重载 Tabs(config)
        if ($Object.isPlain(container)) {
            config = container;
            container = config.container;
        }
    
        config = Object.assign({}, exports.defaults, config);
    
        let emitter = new Emitter(this);
    
        let meta = Meta.create(config, {
            'container': container,
            'this': this,
            'emitter': emitter,
            '$': $(container),              //
        });
    
        mapper.set(this, meta);
    
    
        //对外暴露的属性。
        Object.assign(this, {
            'container': container,
            'id': meta.id,
            '$': meta.$,
        });
    
    }
    
    
    
    
    Tabs.prototype = /**@lends Tabs#*/ {
        constructor: Tabs,
    
        /**
        * 构造实例时传入的 container 参数。
        */
        container: '',
    
        /**
        * 当前实例的 id。
        */
        id: '',
    
        /**
        * 当前实例关联的 DOM 节点对应的 jQuery 实例。
        * 即 $(container) 的快捷方式。
        */
        $: null,
    
        /**
        * 设置模板填充的规则，为模板填充进行预处理。
        */
        template(process) {
            let meta = mapper.get(this);
            let tpl = meta.tpl;
    
            if (!tpl) {
                tpl = meta.tpl = new Template(meta.container);
            }
    
            if (process) {
                tpl.process(...arguments);
            }
    
            //返回给外面，可能要用到。
            //通过 tabs.template() 即可取得 tpl。
            return tpl;
        },
    
        /**
        * 填充数据。
        * 触发事件: `fill`。
        */
        fill(list, process) {
            let meta = mapper.get(this);
            let tpl = this.template(process); //确保 meta.tpl 存在，同时设置填充规则。
            let html = tpl.fill(list);
    
            meta.$.html(html);
            meta.list = list;
    
            meta.reset();
            meta.emitter.fire('fill', [list]);
    
            return html;
        },
    
        /**
        * 渲染列表。
        * 触发事件: `render`。
        */
        render(list, process) {
            let meta = mapper.get(this);
    
            //首次渲染。
            if (!meta.change) {
                Events.bind(meta);
            }
    
            if (list) {
                this.fill(list, process);
            }
    
            meta.emitter.fire('render', [list]);
    
        },
    
        /**
        * 激活指定的项。
        * 已重载 active(index);            //不传递任何附加数据，触发事件。
        * 已重载 active(index, true);      //不传递任何附加数据，触发事件。 
        * 已重载 active(index, options);   //传递一些附加数据，触发事件。
        * 已重载 active(index, false);     //不传递任何附加数据，也不触发事件，在某种场景下会用到。
        * @param {number} index 要激活的项的索引值。
        * @param {Object} options 要传递给事件的附加数据。 
        */
        active(index, options) {
            let fireEvent = true; //默认为触发事件。
    
            //重载
            if (typeof options == 'boolean') {
                fireEvent = options;
                options = {};
            }
            else {
                options = options || {};
            }
    
            let meta = mapper.get(this);
            let current = meta.current;
    
    
            //当前项已激活，并且配置指定了不允许激活重复的项。
            if (index == current.index && !meta.repeated) {
                return;
            }
    
    
            let item = meta.list[index] || null;
            let actived = meta.activedClass;
            let old = Object.assign({}, current);           //先备份。
    
            if (current.$) {
                current.$.removeClass(actived);    //移除上次已激活过的样式类名。
            }
    
            current.index = index;
            current.item = item;
            current.event = options.event;
            current.$ = meta.$.find(`${meta.selector}:eq(${index})`); //如 `>li:eq(2)`。
    
    
            let info = {
                'current': current,
                'old': old,
                'options': options,
            };
    
    
            meta.activing(info, function () {
                current.$.addClass(actived);
    
                //指定了使用安静模式，则不触发事件。
                if (!fireEvent) {
                    return;
                }
    
    
                let args = [item, index, info];
                let cmd = item ? item.cmd || '' : '';
    
                meta.emitter.fire('before-change', args);
                meta.emitter.fire('change', `${index}`, args);
    
                //触发指定的事件名。
                if (cmd) {
                    meta.emitter.fire('change', cmd, args);
                }
    
                meta.emitter.fire('change', args);
            });
    
        },
    
        /**
        * 移除指定的项。
        * 仅处理数据和激活项的状态，不移除 DOM 节点。
        * 触发事件: `before-remove`、`remove`。
        */
        remove(index) {
            let meta = mapper.get(this);
            let activedIndex = meta.current.index;
    
            meta.fire('before-remove', [index]);
    
            //移除的是当前激活项之前的，则重新设置激活状态即可。
            if (index < activedIndex) {
                this.active(activedIndex - 1, false);
            }
            else if (index == activedIndex) {
                //移除的是当前的激活项
                meta.reset();
            }
    
            meta.list.splice(index, 1);
    
            meta.fire('remove', [index]);
    
        },
    
        /**
        * 重置当前组件到未选中状态。
        */
        reset() {
            let meta = mapper.get(this);
            meta.reset();
        },
    
    
        /**
        * 获取当前实例激活的索引值。
        */
        getActivedIndex() {
            let meta = mapper.get(this);
    
            return meta.current.index;
        },
    
        /**
        * 获取或设置 active 时的动画过渡效果函数。
        * 业务层可传入(设置)一个函数 fn 以实现页签激活的动画过渡效果。
        * 函数 fn 会接受到两个参数:
        *   info: { current, old, options, },   //激活过程中的相关信息。
        *   done: function,                     //完成后的回调函数。
        * 在函数 fn 中必须手动调用一下参数中传入的 done() 回调函数，以通知本组件进行后续处理。
        * @example:
        *   tabs.activing(function (info, done) { 
        *       console.log(info);
        *       done();
        *   });
        */
        activing(fn) {
            let meta = mapper.get(this);
    
            fn = fn || meta.activing;
    
            if (typeof fn != 'function') {
                throw new Error('参数 fn 必须为 function 类型。');
            }
    
            meta.activing = fn;
    
            return fn; //业务层可能会到。
        },
    
        /**
        * 绑定事件。
        */
        on(...args) {
            let meta = mapper.get(this);
            meta.emitter.on(...args);
        },
    
        /**
        * 销毁本组件。
        */
        destroy() {
            let meta = mapper.get(this);
    
            meta.emitter.destroy();
            meta.tpl.destroy();
            meta.$.off();
    
            mapper.delete(this);
        },
    
    
    
    
    
    };
    
    
    Tabs.defaults = require('Tabs.defaults');
    module.exports = exports = Tabs;
});
/**
* src: @definejs/toast/modules/Toast/Masker.js
* pkg: @definejs/toast@1.0.0
*/
define('Toast/Masker', function (require, module, exports) { 
    const Masker = require('Masker');
    
    module.exports = {
        create(config) {
    
            let defaults = {
                'container': config.container,
            };
    
            let options = Masker.normalize(defaults, config.mask); //返回一个 {} 或 null。
    
    
            if (!options) {
                return null;
            }
    
            Object.assign(options, {
                'z-index': config['z-index'] - 1,
            });
    
            let masker = new Masker(options);
    
    
            return masker;
    
        },
    };
});
/**
* src: @definejs/toast/modules/Toast/Meta.js
* pkg: @definejs/toast@1.0.0
*/
define('Toast/Meta', function (require, module, exports) { 
    
    const $String = require('String');
    
    const prefix = 'definejs-toast-';     //用于生成组件 id 的前缀部分。
    const suffix = 4;                     //用于生成组件 id 的随机部分的长度。
    
    
    
    module.exports = {
        create(config, others) {
            let id = $String.randomId(prefix, suffix);
            let textId = $String.randomId(prefix, 'text-', suffix);
            let iconId = $String.randomId(prefix, 'icon-', suffix);
            let text = config.text;
    
            text = typeof text == 'number' ? String(text) : text;
            text = text || '';
    
    
            let meta = {
                'id': id,
                'icon': config.icon,
                'text': text,
                'textId': textId,
                'iconId': iconId,
                'cssClass': config.cssClass || '',
                'container': config.container,
                'duration': config.duration || 0,
                'sample': '',
                'style': '',                //样式字符串。
    
                'masker': null,             // Masker 的实例，重复使用。
                'emitter': null,            //事件驱动器。
                'this': null,               //当前实例，方便内部使用。
                '$': null,                  //组件最外层的 DOM 节点的 jQuery 实例。
                '$icon': null,              //$(iconId)。
                '$text': null,              //$(textId)。
    
            };
    
    
    
            Object.assign(meta, others);
    
    
            return meta;
    
    
        },
    };
});
/**
* src: @definejs/toast/modules/Toast/Sample.js
* pkg: @definejs/toast@1.0.0
*/
define('Toast/Sample', function (require, module, exports) { 
    
    module.exports = `
        <div id="{id}" class="definejs-toast {cssClass}" style="{style}">
            <div>
                <i id="{iconId}" class="fa fa-{icon}"></i>
            </div>
            <span id="{textId}" class="Text">{text}</span>
        </div>
    
    `;
});
/**
* src: @definejs/toast/modules/Toast/Style.js
* pkg: @definejs/toast@1.0.0
*/
define('Toast/Style', function (require, module, exports) { 
    const $Object = require('Object');
    const Style = require('Style');
    
    module.exports = {
        /**
        * 从配置对象中过滤出样式成员，并进行规范化处理。
        * 返回一个样式对象 {}。
        */
        get(config) {
            let obj = $Object.filter(config, ['height', 'width', 'z-index']);
            let style = Style.objectify(config.style);
    
            style = Style.merge(style, obj);
            style = Style.pixelize(style, ['height', 'width',]);
    
            return style;
        },
    
    };
    
    
    
    
});
/**
* src: @definejs/toast/modules/Toast.defaults.js
* pkg: @definejs/toast@1.0.0
*/
define('Toast.defaults', function (require, module, exports) { 
    /**
    * Toast 模块的默认配置。
    * @name Toast.defaults
    */
    module.exports = {
        /**
        * 提示文本。
        */
        text: '',
        /**
        * 组件添加到的容器。
        * 默认为 document.body。
        */
        container: 'body',
        /**
        * 是否启用 mask 层。
        */
        mask: false,
        /**
        * 用到的 font-awsome 的图标。
        */
        icon: 'check',
        /**
        * 显示的持续时间(毫秒)。
        * 0 表示一直显示。
        */
        duration: 0,
        /**
        * 组件用到的 css 类名。
        */
        cssClass: '',
        /**
        * 组件的 css 样式 z-index 值。
        * 为了给其它组件计算 `z-index`，此处需要显式提供一个值。
        * 因为仅用 css 中的会比较麻烦。
        */
        'z-index': 1024,
        /**
        * 组件宽度。
        * 可以指定为百分比的字符串，或指定具体的数值（单位为像素），
        */
        width: '',
        /**
        * 组件高度。
        * 可以指定为百分比的字符串，或指定具体的数值（单位为像素），
        */
        height: '',
        /**
        * 样式集合。
        * 外层的同名字段优先级高于里面的。
        */
        style: {},
    };
    
    
});
/**
* src: @definejs/toast/modules/Toast.js
* pkg: @definejs/toast@1.0.0
*/
define('Toast', function (require, module, exports) { 
    const $ = require('jquery');
    const $Object = require('Object');
    const $String = require('String');
    const $Style = require('Style');
    const Emitter = require('Emitter');
    
    //子模块
    const Sample = module.require('Sample');
    const Style = module.require('Style');
    const Meta = module.require('Meta');
    const Masker = module.require('Masker');
    
    const mapper = new Map();
    
    
    
    /**
    * 构造器。
    * @constructor
    */
    function Toast(config) {
        config = $Object.deepAssign({}, exports.defaults, config);
    
        let emitter = new Emitter(this);        //事件驱动器。
        let style = Style.get(config);          //
        let masker = Masker.create(config);     //
    
        let meta = Meta.create(config, {
            'sample': Sample,       //相应的 html 模板。
            'style': style,         //从配置中过滤出样式成员，并进行规范化处理，style 是一个 {}。
            'emitter': emitter,     //事件驱动器。
            'masker': masker,       //遮罩层实例。
            'this': this,           //当前实例，方便内部使用。
        });
    
    
        mapper.set(this, meta);
    
    
        //对外暴露的属性。
        Object.assign(this, {
            'id': meta.id,
        });
    
    }
    
    
    //实例方法
    Toast.prototype = /**@lends Toast#*/ {
        constructor: Toast,
    
        /**
        * 当前实例的 id。
        * 也是最外层的 DOM 节点的 id。
        */
        id: '',
    
        /**
        * 当前组件最外层的 DOM 节点对应的 jQuery 实例。
        * 必须在 render 之后才存在。
        */
        $: null,
    
        /**
        * 渲染本组件，生成 html 到容器 DOM 节点中。
        * 该方法只允许调用一次。
        * 触发事件: `render`。
        */
        render() {
            let meta = mapper.get(this);
    
            //已经渲染过了。
            if (meta.$) {
                return;
            }
    
            let style = $Style.stringify(meta.style);
    
            let html = $String.format(meta.sample, {
                'id': meta.id,
                'icon': meta.icon,
                'text': meta.text,
                'textId': meta.textId,
                'iconId': meta.iconId,
                'cssClass': meta.cssClass,
                'style': style,
            });
    
            $(meta.container).append(html);
    
            meta.$ = this.$ = $(`#${meta.id}`);
            meta.$icon = $(`#${meta.iconId}`);
            meta.$text = $(`#${meta.textId}`);
    
            meta.emitter.fire('render');
    
        },
    
    
        /**
        * 显示本组件。
        * 已重载 show(text);       //显示指定的文本。
        * 已重载 show(done);       //显示组件，完成后执行回调函数。 要显示的文本以创建实例时指定的为准。
        * 已重载 show(text, done); //显示指定的文本，完成后执行回调函数。
        * 参数：
        *   text: '',       //要显示的文本。
        *   done: fn,       //完成后回调函数。 须在创建实例时指定 `duration` 字段为大于 0 的值才起作用。 
        */
        show(text, done) {
            //重载 show(done); 
            //不传入要显示的文本，以创建实例时指定的 text 为准。
            if (typeof text == 'function') {
                done = text;
                text = undefined;
            }
    
            let meta = mapper.get(this);
            let masker = meta.masker;
            let duration = meta.duration;
    
    
            //首次 render。
            if (!meta.$) {
                this.render();
            }
    
            if (masker) {
                masker.show();
            }
    
            if (typeof text == 'string') {
                meta.text = text;
                meta.$text.html(text);
            }
    
            if (duration) {
                setTimeout(function () {
                    meta.this.hide();
                    done && done();
    
                }, duration);
            }
    
            meta.$.toggleClass('NoIcon', !meta.icon);
            meta.$.toggleClass('NoText', !meta.text);
            meta.$.show();
            meta.emitter.fire('show');
    
    
        },
    
        /**
        * 隐藏本组件。
        * 触发事件: `hide`。
        */
        hide() {
            let meta = mapper.get(this);
            let masker = meta.masker;
    
            if (!meta.$) {
                return;
            }
    
            masker && masker.hide();
            meta.$.hide();
            meta.emitter.fire('hide');
    
        },
    
        /**
        * 移除本组件已生成的 DOM 节点。
        * 触发事件: `remove`。
        */
        remove() {
            let meta = mapper.get(this);
    
            if (!meta.$) {
                return;
            }
    
            let div = meta.$.get(0);
            let masker = meta.masker;
    
            div.parentNode.removeChild(div);
            masker && masker.remove();
    
    
            meta.$.off();
    
            meta.$ = this.$ = null;
            meta.$icon = null;
            meta.$text = null;
            meta.masker = null;
    
            meta.emitter.fire('remove');
        },
    
        /**
        * 绑定事件。
        */
        on(...args) {
            var meta = mapper.get(this);
            meta.emitter.on(...args);
        },
    
        /**
        * 销毁本组件
        */
        destroy() {
            let meta = mapper.get(this);
    
            this.remove();
    
            meta.emitter.destroy();
            mapper.remove(this);
        },
    
    };
    
    Toast.defaults = require('Toast.defaults');
    module.exports = exports = Toast;
});
/**
* src: @definejs/view/modules/View.defaults.js
* pkg: @definejs/view@1.0.0
*/
define('View.defaults', function (require, module, exports) { 
    /**
    * View 模块的默认配置。
    * @name View.defaults
    */
    module.exports = {
        /**
        * 针对移动端的。
        */
        ViewSlider: null,   
        /**
        * 所关联的 DOM 节点容器的选择器模板。
        */
        container: '[data-view="{id}"]',
        /**
        * 背景样式。
        */
        background: '',
    };
});
/**
* src: @definejs/view/modules/View.js
* pkg: @definejs/view@1.0.0
*/
define('View', function (require, module, exports) { 
    const Panel = require('Panel');
    
    /**
    * 构造器。
    * @constructor
    */
    function View(container, config) {
        config = Object.assign({}, exports.defaults, config);
    
        Panel.call(this, container, config);
    
        this.$.addClass('definejs-view'); //这两个类名必须加上。
    
        if (config.background) {
            this.$.css('background', config.background);
        }
    
        //针对移动端的全屏视图模式。
        //这里只负责有针对性的加上 `FullScreen` 类，而不用去掉该类。
        //因为业务层可能自行加上了该类，但 fullscreen 为 false。
        if (config.fullscreen) {
            this.$.addClass('FullScreen');
        }
    }
    
    //从 Panel 类继承。
    //扩展的实例成员。
    View.prototype = Object.assign(new Panel(), {
        /**
        * 仅针对移动端的代码。
        * 启用/禁用视图的滑动返回。
        */
        slider: function (enabled) {
            let ViewSlider = exports.defaults.ViewSlider;
    
            if (!ViewSlider) {
                return;
            }
    
            ViewSlider.slide(this, enabled);
        },
    });
    
    
    //扩展静态成员。
    Object.assign(View, {
        /**
        * 默认配置。
        */
        defaults: require('View.defaults'),
        
        /**
        * 提供一种按标准方法定义视图的方式。
        */
        define: function (id, factory) {
            Panel.define(id, factory, {
                'constructor': View,
                'defaults': exports.defaults,
            });
        },
    
        /**
        * 更新容器。
        * 已重载 update(id);   //更新单个。
        * 已重载 update(ids);  //更新多个。
        */
        update: function (ids) {
            Panel.update(ids, {
                'defaults': exports.defaults,
            });
        },
    
    
    });
    
    module.exports = exports = View;
});

define('jquery', function (require, module, exports) { 
    return global['jQuery'];
});

define('circular-json', function (require, module, exports) { 
    /*!
    Copyright (C) 2013-2017 by Andrea Giammarchi - @WebReflection
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
    
    */
    var
      // should be a not so common char
      // possibly one JSON does not encode
      // possibly one encodeURIComponent does not encode
      // right now this char is '~' but this might change in the future
      specialChar = '~',
      safeSpecialChar = '\\x' + (
        '0' + specialChar.charCodeAt(0).toString(16)
      ).slice(-2),
      escapedSafeSpecialChar = '\\' + safeSpecialChar,
      specialCharRG = new RegExp(safeSpecialChar, 'g'),
      safeSpecialCharRG = new RegExp(escapedSafeSpecialChar, 'g'),
    
      safeStartWithSpecialCharRG = new RegExp('(?:^|([^\\\\]))' + escapedSafeSpecialChar),
    
      indexOf = [].indexOf || function(v){
        for(var i=this.length;i--&&this[i]!==v;);
        return i;
      },
      $String = String  // there's no way to drop warnings in JSHint
                        // about new String ... well, I need that here!
                        // faked, and happy linter!
    ;
    
    function generateReplacer(value, replacer, resolve) {
      var
        doNotIgnore = false,
        inspect = !!replacer,
        path = [],
        all  = [value],
        seen = [value],
        mapp = [resolve ? specialChar : '[Circular]'],
        last = value,
        lvl  = 1,
        i, fn
      ;
      if (inspect) {
        fn = typeof replacer === 'object' ?
          function (key, value) {
            return key !== '' && replacer.indexOf(key) < 0 ? void 0 : value;
          } :
          replacer;
      }
      return function(key, value) {
        // the replacer has rights to decide
        // if a new object should be returned
        // or if there's some key to drop
        // let's call it here rather than "too late"
        if (inspect) value = fn.call(this, key, value);
    
        // first pass should be ignored, since it's just the initial object
        if (doNotIgnore) {
          if (last !== this) {
            i = lvl - indexOf.call(all, this) - 1;
            lvl -= i;
            all.splice(lvl, all.length);
            path.splice(lvl - 1, path.length);
            last = this;
          }
          // console.log(lvl, key, path);
          if (typeof value === 'object' && value) {
        	// if object isn't referring to parent object, add to the
            // object path stack. Otherwise it is already there.
            if (indexOf.call(all, value) < 0) {
              all.push(last = value);
            }
            lvl = all.length;
            i = indexOf.call(seen, value);
            if (i < 0) {
              i = seen.push(value) - 1;
              if (resolve) {
                // key cannot contain specialChar but could be not a string
                path.push(('' + key).replace(specialCharRG, safeSpecialChar));
                mapp[i] = specialChar + path.join(specialChar);
              } else {
                mapp[i] = mapp[0];
              }
            } else {
              value = mapp[i];
            }
          } else {
            if (typeof value === 'string' && resolve) {
              // ensure no special char involved on deserialization
              // in this case only first char is important
              // no need to replace all value (better performance)
              value = value .replace(safeSpecialChar, escapedSafeSpecialChar)
                            .replace(specialChar, safeSpecialChar);
            }
          }
        } else {
          doNotIgnore = true;
        }
        return value;
      };
    }
    
    function retrieveFromPath(current, keys) {
      for(var i = 0, length = keys.length; i < length; current = current[
        // keys should be normalized back here
        keys[i++].replace(safeSpecialCharRG, specialChar)
      ]);
      return current;
    }
    
    function generateReviver(reviver) {
      return function(key, value) {
        var isString = typeof value === 'string';
        if (isString && value.charAt(0) === specialChar) {
          return new $String(value.slice(1));
        }
        if (key === '') value = regenerate(value, value, {});
        // again, only one needed, do not use the RegExp for this replacement
        // only keys need the RegExp
        if (isString) value = value .replace(safeStartWithSpecialCharRG, '$1' + specialChar)
                                    .replace(escapedSafeSpecialChar, safeSpecialChar);
        return reviver ? reviver.call(this, key, value) : value;
      };
    }
    
    function regenerateArray(root, current, retrieve) {
      for (var i = 0, length = current.length; i < length; i++) {
        current[i] = regenerate(root, current[i], retrieve);
      }
      return current;
    }
    
    function regenerateObject(root, current, retrieve) {
      for (var key in current) {
        if (current.hasOwnProperty(key)) {
          current[key] = regenerate(root, current[key], retrieve);
        }
      }
      return current;
    }
    
    function regenerate(root, current, retrieve) {
      return current instanceof Array ?
        // fast Array reconstruction
        regenerateArray(root, current, retrieve) :
        (
          current instanceof $String ?
            (
              // root is an empty string
              current.length ?
                (
                  retrieve.hasOwnProperty(current) ?
                    retrieve[current] :
                    retrieve[current] = retrieveFromPath(
                      root, current.split(specialChar)
                    )
                ) :
                root
            ) :
            (
              current instanceof Object ?
                // dedicated Object parser
                regenerateObject(root, current, retrieve) :
                // value as it is
                current
            )
        )
      ;
    }
    
    var CircularJSON = {
      stringify: function stringify(value, replacer, space, doNotResolve) {
        return CircularJSON.parser.stringify(
          value,
          generateReplacer(value, replacer, !doNotResolve),
          space
        );
      },
      parse: function parse(text, reviver) {
        return CircularJSON.parser.parse(
          text,
          generateReviver(reviver)
        );
      },
      // A parser should be an API 1:1 compatible with JSON
      // it should expose stringify and parse methods.
      // The default parser is the native JSON.
      parser: JSON
    };
    
    module.exports = CircularJSON;
    
});

//重新定义多一份 module-manager 相关的模块，以给内部的其它包使用。
BaseMM.each(function (id) {
    InnerMM.define(id, function (require, module, exports) {
        return BaseMM.require(id);
    });
});

//导出的全局对象。
//以下代码由 `@definejs/packer` 工具处理生成。
global['KISP'] = (function ({ require, bind, }) {
    let exports = {
        require,
        /**
        * 加载 definejs 内部的公共模块，并创建它的一个实例。
        * @param {string} id 模块的名称(id)。
        * @return {Object} 返回该模块所创建的实例。
        */
        create(id, ...args) {
            let M = require(id);
            return new M(...args);
        },
    };

    exports['alert'] = bind('Alert', 'show');
    exports['confirm'] = bind('Confirm', 'show');
    exports['config'] = bind('Defaults', 'config');
    exports['data'] = bind('AppModule', 'data');
    exports['launch'] = bind('App', 'launch');
    exports['load'] = bind('Package', 'load');
    exports['panel'] = bind('Panel', 'define');
    exports['proxy'] = bind('Proxy', 'response');
    exports['route'] = bind('App', 'route');
    exports['view'] = bind('View', 'define');
    exports['create'] = function (id, ...args) {
                let M = require(id);
                return new M(...args);
            };

    exports['modules'] = [
        //外部可以通过 KISP.require(id) 进行使用的模块列表，共 38 个。
        'API',
        'Alert',
        'App',
        'AppModule',
        'Array',
        'Confirm',
        'Date',
        'Defaults',
        'Dialog',
        'Emitter',
        'Escape',
        'Fn',
        'HTMLParser',
        'Hash',
        'JSON',
        'Loading',
        'LocalStorage',
        'Masker',
        'Math',
        'ModuleManager',
        'Navigator',
        'Object',
        'Package',
        'Panel',
        'Proxy',
        'Query',
        'Script',
        'SessionStorage',
        'String',
        'Style',
        'Tabs',
        'Tasker',
        'Template',
        'Timer',
        'Toast',
        'Tree',
        'Url',
        'View',
    ];

    return exports;
})(InnerMM);







}) (
    window,  // 在浏览器环境中。

    top,
    parent,
    window,
    document,
    location,
    navigator,
    localStorage,
    sessionStorage,
    console,
    history,
    setTimeout,
    setInterval,

    Array,
    Boolean,
    Date,
    Error,
    Function,
    JSON,
    Map,
    Math,
    Number,
    Object,
    RegExp,
    String,

    undefined
);
