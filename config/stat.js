

module.exports = {
    htdocs: 'htdocs/',
    //解析成功后要输出的 json 数据的目录。
    //如果不指定，则不输出。
    // output: 'output/stat/',

    module: {
        defines: [
            'define',
            'define.panel',
            'define.view',
            'definejs.launch', //注意这个是针对 launch() 的。

        ],

        patterns: [
            'data/**/*.js',
            'lib/**/*.js',
            'modules/**/*.js',
            'views/**/*.js',
            'index.js',     //注意这个是针对 launch() 的。
        ],

        excludes: [ ],
    },

    html: {
        //用来提取出引用了 html 片段文件的标签的正则表达式。
        link: /<link\s+.*rel\s*=\s*["\']html["\'].*\/>/ig,

        //用来提取 panel 或者 view 关联模块的选择器。
        selectors: [
            '[data-view]',
            '[data-panel]',
        ],

        patterns: [
            '**/*.master.html',
            'lib/**/*.html',
            'modules/**/*.html',
            'views/**/*.html',
        ],

        excludes: [],
    },


  

};