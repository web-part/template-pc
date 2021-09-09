

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