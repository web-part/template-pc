
const SessionStorage = require('@definejs/session-storage');

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

