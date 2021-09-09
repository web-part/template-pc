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