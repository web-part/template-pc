/**
* src: @definejs/string/modules/String.js
* pkg: @definejs/string@1.0.0
*/
define('String', function (require, module, exports) { 
    
    /**
     * 字符串工具。
     */
    module.exports = exports = {
        /**
        * 用指定的值去填充一个字符串模板。
        * @param {String} str 要进行填充的字符串模板。
        * @param {Object} obj 要填充的键值对的数据对象。
        * @return 返回一个用值去填充后的字符串。
        * @example
        *   $String.format('{id},{type}', {id: 1, type: 'app'}); //返回 `1,app`
        *   $String.format('{2}{0}{1}', 'a', 'b', 'c'); //返回 `cab`
        */
        format(str, obj) {
            let s = str;
            let replaceAll = exports.replaceAll;
    
            //一个内部的填充函数。
            let fill = (str, key, value) => { 
                if (Array.isArray(value)) {
                    value = value.join('');
                }
    
                str = replaceAll(str, `{${key}}`, value);
                return str;
            };
    
            if (typeof obj == 'object') {
                for (let key in obj) {
                    s = fill(s, key, obj[key]);
                }
            }
            else {
                let args = [...arguments].slice(1);
    
                args.forEach(function (index, item) { 
                    s = fill(s, index, item);
                });
            }
    
            return s;
        },
    
        /**
        * 对字符串进行全局替换。
        * @param {String} target 要进行替换的目标字符串。
        * @param {String} src 要进行替换的子串，旧值。
        * @param {String} dest 要进行替换的新子串，新值。
        * @return {String} 返回一个替换后的字符串。
        * @example
        *   $String.replaceAll('abcdeabc', 'bc', 'BC') //结果为 aBCdeBC
        */
        replaceAll(target, src, dest) {
            return target.split(src).join(dest);
        },
    
    
        /**
        * 对字符串进行区间内的替换。
        * 该方法会把整个区间替换成新的字符串，包括区间标记。
        * 已重载 replaceBetween(s, { begin, end, value, });
        * @param {String} s 要进行替换的目标字符串。
        * @param {String} beginTag 区间的开始标记。
        * @param {String} endTag 区间的结束标记
        * @param {String} value 要进行替换的新子串，新值。
        * @return {String} 返回一个替换后的字符串。
        *   当不存在开始标记或结束标记时，都会不进行任何处理而直接返回原字符串。
        * @example
        *   $String.replaceBetween('hello #--world--# this is #--good--#', '#--', '--#', 'javascript') 
        *   //结果为 'hello javascript this is javascript'
        */
        replaceBetween(s, beginTag, endTag, value) {
            //重载 replaceBetween(s, opt);
            if (typeof beginTag == 'object') {
                let opt = beginTag;
                beginTag = opt.begin;
                endTag = opt.end;
                value = opt.value;
            }
    
    
            if (s.indexOf(beginTag) < 0 || s.indexOf(endTag) < 0) {
                return s;
            }
    
            let list = s.split(beginTag).map(function (item) {
                let a = item.split(endTag);
    
                if (a.length == 1) {
                    return a[0];
                }
    
                return value + a.slice(1).join(endTag);
    
            });
    
    
            s = list.join('');
    
            return s;
    
        },
    
    
        /**
        * 右对齐此实例中的字符，在左边用指定的 Unicode 字符填充以达到指定的总长度。
        * 当指定的总长度小实际长度时，将从右边开始算起，做截断处理，以达到指定的总长度。
        * @param {String} str 要进行填充对齐的字符串。
        * @param {Number} totalWidth 填充后要达到的总长度。
        * @param {String} paddingChar 用来填充的模板字符串。
        * @return {String} 返回一个经过填充对齐后的新字符串。
        * @example
        *   $String.padLeft('1234', 6, '0'); //结果为 '001234'，右对齐，从左边填充 '0'
        *   $String.padLeft('1234', 2, '0'); //结果为 '34'，右对齐，从左边开始截断
        */
        padLeft(str, totalWidth, paddingChar) {
            str = String(str); //转成字符串
    
            let len = str.length;
            if (totalWidth <= len) { //需要的长度短于实际长度，做截断处理
                return str.substr(-totalWidth); //从后面算起
            }
    
            paddingChar = paddingChar || ' ';
    
            let arr = [];
            arr.length = totalWidth - len + 1;
    
            return arr.join(paddingChar) + str;
        },
    
    
        /**
        * 左对齐此字符串中的字符，在右边用指定的 Unicode 字符填充以达到指定的总长度。
        * 当指定的总长度小实际长度时，将从左边开始算起，做截断处理，以达到指定的总长度。
        * @param {String} str 要进行填充对齐的字符串。
        * @param {Number} totalWidth 填充后要达到的总长度。
        * @param {String} paddingChar 用来填充的模板字符串。
        * @return {String} 返回一个经过填充对齐后的新字符串。
        * @example
        *   $String.padLeft('1234', 6, '0'); //结果为 '123400'，左对齐，从右边填充 '0'
        *   $String.padLeft('1234', 2, '0'); //结果为 '12'，左对齐，从右边开始截断
        */
        padRight(str, totalWidth, paddingChar) {
            let s = String(str); //转成字符串
            let len = s.length;
    
            if (len >= totalWidth) {
                return s.substring(0, totalWidth);
            }
    
            paddingChar = paddingChar || ' ';
    
            let arr = [];
            arr.length = totalWidth - len + 1;
    
    
            return s + arr.join(paddingChar);
        },
    
        /**
        * 获取位于两个标记子串之间的子字符串。
        * @param {String} str 要进行获取的大串。
        * @param {String} beginTag 区间的开始标记。
        * @param {String} endTag 区间的结束标记。
        * @return {String} 返回一个子字符串。当获取不能结果时，统一返回空字符串。
        * @example
        *   $String.between('abc{!hello!} world', '{!', '!}'); //结果为 'hello' 
        */
        between(str, beginTag, endTag) {
            let startIndex = str.indexOf(beginTag);
            if (startIndex < 0) {
                return '';
            }
    
            startIndex += beginTag.length;
    
            let endIndex = str.indexOf(endTag, startIndex);
    
            if (endIndex < 0) {
                return '';
            }
    
            return str.substr(startIndex, endIndex - startIndex);
        },
    
        /**
        * 产生指定格式或长度的随机字符串。
        * @param {String|int} [formater=12] 随机字符串的格式，或者长度（默认为12个字符）。
        *   格式中的每个随机字符用 'x' 来占位，如 'xxxx-1x2x-xx'
        * @return {String} 返回一个指定长度的随机字符串。
        * @example
        *   $String.random();      //返回一个 12 位的随机字符串
        *   $String.random(64);    //返回一个 64 位的随机字符串
        *   $String.random('xxxx-你好xx-xx'); //类似 'A3EA-你好B4-DC'
        */
        random(formater) {
            if (formater === undefined) {
                formater = 12;
            }
    
            //如果传入的是数字，则生成一个指定长度的格式字符串 'xxxxx...'
            if (typeof formater == 'number') {
                let size = formater + 1;
                if (size < 0) {
                    size = 0;
                }
    
                formater = [];
                formater.length = size;
                formater = formater.join('x');
            }
    
            return formater.replace(/x/g, function (c) {
                let r = Math.random() * 16 | 0;
                return r.toString(16);
            }).toUpperCase();
        },
    
        /**
        * 根据指定的规则生成一个随机 id。
        */
        randomId(...list) {
    
            list = list.map(function (item, index) {
    
                if (typeof item == 'number') {
                    item = exports.random(item);
                    item = item.toLowerCase();
                }
    
                return item;
            });
    
            return list.join('');
    
        },
    
    
        //---------------转换部分 -----------------------------------------------------
    
        /**
        * 把一个字符串转成骆驼命名法。。
        * 如 'font-size' 转成 'fontSize'。
        * @param {String} str 要进行转换的字符串。
        * @return 返回一个骆驼命名法的新字符串。
        * @example
        *   $String.toCamelCase('background-item-color') //结果为 'backgroundItemColor'
        */
        toCamelCase(str) {
            let rmsPrefix = /^-ms-/;
            let rdashAlpha = /-([a-z]|[0-9])/ig;
    
            return str.replace(rmsPrefix, 'ms-').replace(rdashAlpha, function (all, letter) {
                return letter.toString().toUpperCase();
            });
    
            /* 下面的是 mootool 的实现
            return str.replace(/-\D/g, function(match) {
                return match.charAt(1).toUpperCase();
            });
            */
        },
    
        /**
        * 把一个字符串转成短线连接法。
        * 如 fontSize 转成 font-size
        * @param {String} str 要进行转换的字符串。
        * @return 返回一个用短线连接起来的新字符串。
        * @example
        *   $String.toHyphenate('backgroundItemColor') //结果为 'background-item-color'
        */
        toHyphenate(str) {
            return str.replace(/[A-Z]/g, function (match) {
                return ('-' + match.charAt(0).toLowerCase());
            });
        },
    
        /**
        * 把一个字符串转成 UTF8 编码。
        * @param {String} str 要进行编码的字符串。
        * @return {String} 返回一个 UTF8 编码的新字符串。
        * @example
        *   $String.toUtf8('你好'); //结果为 ''
        */
        toUtf8(str) {
            let a = [];
    
            str.split('').forEach(function (ch, index) {
                let code = ch.charCodeAt(0);
    
                if (code < 0x80) {
                    a.push(code);
                }
                else if (code < 0x800) {
                    a.push(((code & 0x7C0) >> 6) | 0xC0);
                    a.push((code & 0x3F) | 0x80);
                }
                else {
                    a.push(((code & 0xF000) >> 12) | 0xE0);
                    a.push(((code & 0x0FC0) >> 6) | 0x80);
                    a.push(((code & 0x3F)) | 0x80);
                }
            });
    
            a = a.map(function (item, index) {
                return item.toString(16);
            });
    
            return '%' + a.join('%');
        },
    
    
        /**
        * 把一个字符串转成等价的值。
        * 主要是把字符串形式的 0|1|true|false|null|undefined|NaN 转成原来的数据值。
        * 当参数不是字符串或不是上述值之一时，则直接返回该参数，不作转换。
        * @param {Object} value 要进行转换的值，可以是任何类型。
        * @return {Object} 返回一个等价的值。
        * @example
        *   $String.toValue('NaN') //NaN
        *   $String.toValue('null') //null
        *   $String.toValue('true') //true
        *   $String.toValue('false') //false
        *   $String.toValue({}) //不作转换，直接原样返回
        */
        toValue(value) {
            if (typeof value != 'string') { //拦截非字符串类型的参数
                return value;
            }
    
            let maps = {
                //'0': 0,
                //'1': 1,
                'true': true,
                'false': false,
                'null': null,
                'undefined': undefined,
                'NaN': NaN
            };
    
            return value in maps ? maps[value] : value;
    
        },
    
        //---------------分裂和提取部分 -----------------------------------------------------
    
        /**
        * 对一个字符串进行多层次分裂，返回一个多维数组。
        * @param {String} str 要进行分裂的字符串。
        * @param {Array} separators 分隔符列表数组。
        * @return {Array} 返回一个多维数组，该数组的维数，跟指定的分隔符 separators 的长度一致。
        * @example
            var str = 'a=1&b=2|a=100&b=200;a=111&b=222|a=10000&b=20000';
            var separators = [';', '|', '&', '='];
            var a = $String.split(str, separators);
            //结果 a 为
            a = 
            [                           // ';' 分裂的结果
                [                       // '|'分裂的结果
                    [                   // '&'分裂的结果
                        ['a', '1'],     // '='分裂的结果
                        ['b', '2']
                    ],
                    [
                        ['a', '100'],
                        ['b', '200']
                    ]
                ],
                [
                    [
                        ['a', '111'],
                        ['b', '222']
                    ],
                    [
                        ['a', '10000'],
                        ['b', '20000']
                    ]
                ]
            ];
        * 
        */
        split(str, separators) {
            let list = String(str).split(separators[0]);
    
            for (let i = 1, len = separators.length; i < len; i++) {
                list = fn(list, separators[i], i);
            }
    
            return list;
    
    
            //一个内部方法
            function fn(list, separator, dimension) {
                dimension--;
    
                return list.map(function (item, index) {
                    return dimension == 0 ?
                        String(item).split(separator) :
                        fn(item, separator, dimension); //递归
                });
            }
    
    
        },
    
    
        /**
        * 获取一个字符串的字节长度。
        * 普通字符的字节长度为 1；中文等字符的字节长度为 2。
        * @param {String} s 要进行解析的字符串。
        * @return {Number} 返回参数字符串的字节长度。
        */
        getByteLength(s) {
            if (!s) {
                return 0;
            }
    
            return s.toString().replace(/[\u0100-\uffff]/g, '  ').length;
        },
    };
});