/**
* src: @definejs/math/modules/Math.js
* pkg: @definejs/math@1.0.0
*/
define('Math', function (require, module, exports) { 
    
    module.exports = exports = {
        /**
        * 产生指定闭区间的随机整数。
        * @param {Number} [minValue=0] 闭区间的左端值。
        *   当只指定一个参数时，minValue 默认为 0；
        * @param {Number} [maxValue] 闭区间的右端值。
        * @return 返回一个整数。
        *   当不指定任何参数时，则用 Math.random() 产生一个已移除了小数点的随机整数。
        * @example
        *   $Math.randomInt(100, 200); //产生一个区间为 [100, 200] 的随机整数。
        *   $Math.randomInt(100); //产生一个区间为 [0, 200] 的随机整数。
        *   $Math.randomInt(); //产生一个随机整数。
        */
        randomInt(minValue, maxValue) {
            let len = arguments.length;
    
            //重载 Math.randomInt()
            if (len == 0) { 
                //先称除小数点，再去掉所有前导的 0，最后转为 number
                return Number(String(Math.random()).replace('.', '').replace(/^0*/g, ''));
            }
    
            //重载 Math.randomInt(maxValue)
            if (len == 1) { 
                maxValue = minValue;
                minValue = 0;
            }
    
            let count = maxValue - minValue + 1;
            return Math.floor(Math.random() * count + minValue);
        },
    
        /**
        * 圆形求模方法。
        * 即用圆形链表的方式滑动一个数，返回一个新的数。
        * 即可正可负的双方向求模。
        * 可指定圆形链表的长度(size) 和滑动的步长(step)，滑动步长的正负号指示了滑动方向
        */
        slide(index, size, step) {
            step = step || 1; //步长默认为1
    
            index += step;
    
            if (index >= 0) {
                return index % size;
            }
    
            return (size - (Math.abs(index) % size)) % size;
        },
    
        /**
        * 下一个求模数。
        */
        next(index, size) {
            return exports.slide(index, size, 1);
        },
    
        /**
        * 上一个求模数。
        */
        previous(index, size) {
            return exports.slide(index, size, -1);
        },
    
    
        /**
        * 把一个含有百分号S的字符串解析成等值的小数。
        * @param {String} v 要解析的参数。
        *   期望得到 String 类型，实际可传任何类型。
        * @return {Number} 返回一个小数。
        *   只有参数是字符串，并且去掉前后空格后以百分号结尾才会进行转换；否则直接返回参数。
        *   如果解析失败，则返回 NaN。
        */
        parsePercent(v) {
            if (typeof v != 'string') {
                return v;
            }
    
            let s = v.trim();
    
            if (s.slide(-1) != '%') {
                return v;
            }
    
            return parseFloat(s) / 100;
    
        },
    };
});