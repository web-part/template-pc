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