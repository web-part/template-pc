

module.exports = {
    htdocs: 'htdocs/',
    output: 'output/stat/',

    module: {
        defines: [
            'define',
            'define.panel',
            'define.view',
            'KISP.panel',
            'KISP.view',
        ],

        patterns: [
            'data/**/*.js',
            'lib/**/*.js',
            'modules/**/*.js',
            'views/**/*.js',
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
            'lib/**/*.html',
            'modules/**/*.html',
            'views/**/*.html',
        ],

        excludes: [],
    },


  

};