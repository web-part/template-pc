/**
* 针对兼容版。
*/

module.exports = {

    //构建前要排除在外的文件或目录。
    excludes: [
        //js 分 babel 版本，但 css 的不区分，所以要保留。
        'f/definejs/definejs.debug.js',
        'f/definejs/definejs.min.js',
    ],


};