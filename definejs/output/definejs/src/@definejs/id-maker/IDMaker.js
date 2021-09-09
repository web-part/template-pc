/**
* src: @definejs/id-maker/modules/IDMaker.js
* pkg: @definejs/id-maker@1.0.1
*/
define('IDMaker', function (require, module, exports) { 
    
    const $Object = require('Object');
    const $String = require('String');
    
    const mapper = new Map();
    const name$maker = {};
    
    
    
    class IDMaker {
        
        /**
        * id 生成器的构造器。
        * @param {string} name 命名空间的名称，用于跟其它实例区分。 同一个名称共用同一个实例。
        * @returns {IDMaker} 返回指定命名空间的实例。
        */
        constructor(name, config) {
            if (!name) {
                throw new Error(`必须指定参数 name 为一个非空字符串。`);
            }
    
            let maker = name$maker[name];
    
            if (maker) {
                return maker;
            }
    
            config = $Object.deepAssign({}, exports.defaults, config);
    
            let meta = {
                'name': name,
                'random': config.random,
                'sample': config.sample,
                'group$ids': {},
            };
    
            mapper.set(this, meta);
    
            maker = name$maker[name] = this;
            
        }
    
        /**
        * 获取（生成）指定分组的下一个递增 id。
        * @param {string} [group] 可选，分组名称。 默认为空串。 
        * @returns {string} 指定分组的 id。
        */
        next(group = '') {
            let meta = mapper.get(this);
            let { name, group$ids, random, sample, } = meta;
            let ids = group$ids[group] = group$ids[group] || [];
    
            random = $String.random(random);
            sample = sample[group ? 'group' : ''];
    
            let id = $String.format(sample, {
                'name': name,
                'group': group,
                'index': ids.length, //会自动递增。 从 0 开始。
                'random': random,
            });
    
            ids.push(id);
    
            return id;
    
        }
    
        /**
        * 获取指定分组的 id 的计数。
        * @param {string} [group] 可选，分组名称。 默认为空串。
        * @returns {number} 指定分组的 id 的计数。
        */
        list(group = '') {
            let meta = mapper.get(this);
            let ids = meta.group$ids[group];
    
            //如果有，则复制一份。
            return ids ? ids.slice(0) : null;
        }
    }
    
    
    
    IDMaker.defaults = require('IDMaker.defaults');
    module.exports = exports = IDMaker;
});