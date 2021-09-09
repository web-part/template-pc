# Script.js

js 脚本工具。

``` javascript
const Script = require('@definejs/script');

Script.load({
    url: 'a.js',
    charset: 'utf-8',
    document: document,
    id: 'myScript',
    onload: function (){ },
});

Script.load('a.js', 'utf-8', document, function(){});
Script.load('a.js', 'utf-8', function(){});
Script.load('a.js', document, function(){});
Script.load('a.js', function(){});

//批量加载
Script.load(['a.js', 'b.js'], function(){});

```