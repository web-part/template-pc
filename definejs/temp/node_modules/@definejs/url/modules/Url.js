module.exports = exports = {
    /**
    * 默认配置。
    */
    defaults: require('./Url.defaults'),
    
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