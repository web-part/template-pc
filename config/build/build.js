﻿

module.exports = {

    //要复制到的构建目录。
    dir: 'output/build/',

    //构建前要排除在外的文件或目录。
    //相对于网站的根目录。
    excludes: [
        'babel/',       //生成的。
        'packages/',    //生成的。
        'style/css/',   //生成的。

        'f/definejs/**/*',
        '!f/definejs/dist/',

        'f/jquery/**/*',
        '!f/jquery/dist/jquery.debug.js',
        '!f/jquery/dist/jquery.min.js',

        'f/font-awesome/**/*',
        '!f/font-awesome/css/',
        '!f/font-awesome/fonts/',
    ],

    //构建完成后需要清理的文件或目录。
    cleans: [
        'lib/',
        '**/modules/',
        '**/views/',
        'partial/',
        'routers/',

        '**/*.master.html',
        '**/*.less',
        '**/*.debug.css',
        '**/*.debug.js',
        '**/index.js',
    ],

    //需要进行内容转换的文件。
    process: {
        '**/*.js': function (file, content, require) {
            const BlockList = require('BlockList');

            let list = [
                {
                    begin: '/**webpart.debug.begin*/',
                    end: '/**webpart.debug.end*/',
                    value: "",
                },
                {
                    begin: '/**webpart.test.begin*/',
                    end: '/**webpart.test.end*/',
                    value: '',
                },
            ];

            list.forEach(function (item) {
                content = BlockList.replace(content, item);
            });

            return content;
        },
    },

    masters: {
        lessLink: {
            minify: true,
            name: '{md5}.css',  //如果指定则输出目标文件。
            query: {},
        },

        lessBlock: {
            minify: true,
            inline: false,
            name: '{md5}.css',
            props: {},
            query: {},
        },

        jsBlock: {
            begin: 'partial/begin.js',
            end: 'partial/end.js',
            minify: true,
            inline: false,
            name: '{md5}.js',
            props: {},
            query: {},
        },
        html: {
            //压缩选项详见: https://github.com/kangax/html-minifier。
            minify: {
                collapseWhitespace: true,   //折叠空白。 即删除空行、空格等，压缩最重要的体现。
                minifyJS: true,             //压缩 html 里的 js。
                keepClosingSlash: true,     //保留闭合斜线。
            },
        },
    },

};