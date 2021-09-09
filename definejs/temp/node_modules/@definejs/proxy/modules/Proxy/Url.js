
const Url = require('@definejs/url');
const Query = require('@definejs/query');


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