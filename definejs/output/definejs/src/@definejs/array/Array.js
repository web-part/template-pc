/**
* src: @definejs/array/modules/Array.js
* pkg: @definejs/array@1.1.0
*/
define('Array', function (require, module, exports) { 
    
    /**
    * 数组工具。
    */
    module.exports = exports = {
        /**
        * 把一个数组中的元素转换到另一个数组中，返回一个新的数组。
        * 已重载 map(array, fn);
        * 已重载 map(deep, array, fn);
        * @param {boolean} [deep=false] 指定是否进行深层次迭代。
        *   如果要进行深层次迭代，即对数组元素为数组继续迭代的，请指定 true；否则为浅迭代。
        * @param {Array} array 要进行转换的数组。
        * @param {function} fn 转换函数。
        *   该转换函数会为每个数组元素调用，它会接收到两个参数：当前迭代的数组元素和该元素的索引。
        *   转换函数可以返回转换后的值，有两个特殊值影响到迭代行为：
        *   null：忽略当前数组元素，即该元素在新的数组中不存在对应的项（相当于 continue）；
        *   undefined：忽略当前数组元素到最后一个元素（相当于break）；
        * @return {Array} 返回一个转换后的新数组。
        */
        map(deep, array, fn) {
            //重载 map(array, fn); 此时 deep 为 false。
            if (typeof deep != 'boolean') {
                fn = array;
                array = deep;
                deep = false;
            }
    
            let map = exports.map; //引用自身，用于递归
            let list = [];
    
            for (let i = 0, len = array.length; i < len; i++) {
                let item = array[i];
                let value;
    
                if (deep === true && Array.isArray(item)) {
                    value = map(true, item, fn); // 此时的 value 是一个 []。
                }
                else {
                    value = fn(item, i);
    
                    //忽略掉 null 值的项。
                    if (value === null) {
                        continue;
                    }
    
                    //注意，当回调函数 fn 不返回值时，迭代会给停止掉。
                    if (value === undefined) { 
                        break;
                    }
                }
    
                list.push(value);
            }
    
            return list;
        },
    
        /**
        * 用滑动窗口的方式创建分组，即转成二维数组。
        * @param {Array} array 要进行切割的原数组。
        * @param {Number} windowSize 窗口大小。
        * @param {Number} [stepSize=1] 步长。 默认为 1。
        * @returns {Array} 返回一个二维数组。
        * @example
        *   $Array.slide(['a', 'b', 'c', 'd', 'e'], 3, 1); 
        *   返回结果（窗口大小为 3，移动步长为 1）：
        *   [
        *       ['a', 'b', 'c'],
        *       ['b', 'c', 'd'],
        *       ['c', 'd', 'e'],
        *   ]
        */
        slide(array, windowSize, stepSize = 1) {
            let len = array.length;
    
            //只够创建一组
            if (len <= windowSize) {
                return [array];
            }
    
    
            let groups = [];
    
            for (let i = 0; i < len; i = i + stepSize) {
                let end = i + windowSize;
                let a = array.slice(i, end);
    
                groups.push(a);
    
                if (end >= len) {
                    break; //已达到最后一组
                }
            }
    
            return groups;
        },
    
        /**
        * 创建分组，即转成二维数组。
        * @param {Array} array 要进行切割的原数组。
        * @param {Number} size 分组大小。
        * @param {boolean} isPadRight 是否向右对齐数据。
        * @returns {Array} 返回一个二维数组。
        * @example
        *   $Array.group(['a', 'b', 'c', 'd', 'e'], 3);
        *   返回结果（窗口大小为 3，移动步长为 3）：
        *   [
        *       ['a', 'b', 'c'],
        *       ['d', 'e'],
        *   ]
        * 
        *   $Array.group(['a', 'b', 'c', 'd', 'e'], 3, true); 
        *   则返回：
        *   [
        *       ['a', 'b'],
        *       ['c', 'd', 'e']
        *   ]
        *   
        */
        group(array, size, isPadRight) {
            let groups = exports.slide(array, size, size);
    
            if (isPadRight === true) {
                groups[groups.length - 1] = array.slice(-size); //右对齐最后一组
            }
    
            return groups;
        },
    
        /**
        * 产生一个区间为 [start, end) 的半开区间的数组。
        * 已重载 pad(start, end, step, fn);
        * 已重载 pad(start, end, fn);
        * 已重载 pad(start, end);
        * @param {number} start 半开区间的开始值。
        * @param {number} end 半开区间的结束值。
        * @param {number} [step=1] 填充的步长，默认值为 1。可以指定为负数。
        * @param {function} [fn] 转换函数。 会收到当前项和索引值作为参数。
        * @return {Array} 返回一个递增（减）的数组。
        *   当 start 与 end 相等时，返回一个空数组。
        * @example
            $Array.pad(2, 5); //产生一个从 2 到 5 的数组，步长为1，结果为[2, 3, 4]
            $Array.pad(1, 9, 2); //产生一个从1到9的数组，步长为2，结果为[1, 3, 5, 7]
            $Array.pad(5, 2, -1); //产生一个从5到2的数组，步长为-1，结果为[5, 4, 3]
            //下面的例子得到 [10, 20]
            $Array.pad(1, 3, function (item, index) {
                return item * 10;
            });
        */
        pad(start, end, step, fn) {
            if (start == end) {
                return [];
            }
    
            // 重载 pad(start, end, fn)
            if (typeof step == 'function') {
                fn = step;
                step = 1;
            }
            else {
                step = Math.abs(step || 1);
            }
    
    
            let a = [];
            let index = 0;
    
            if (start < end) { //升序
                for (let i = start; i < end; i += step) {
                    let item = fn ? fn(i, index) : i;
                    a.push(item);
                    index++;
                }
            }
            else { //降序
                for (let i = start; i > end; i -= step) {
                    let item = fn ? fn(i, index) : i;
                    a.push(item);
                    index++;
                }
            }
    
            return a;
    
        },
    
        /**
        * 添加元素到多级分组列表中。
        * 已重载 add(key$list, keys, item);
        * 已重载 add(key$list, key0, key1, ..., keyN, item);
        * @param {Object}} key$list 多级结构的容器普通对象。
        * @param {Array} keys 节点对应的键数组。
        * @param {*} item 要添加的元素。
        * @example
        *   let city$area$town = {};
        *   add(city$area$town, '深圳市', '宝安区', '沙井', 100);
        *   add(city$area$town, '深圳市', '宝安区', '沙井', 200);
        *   add(city$area$town, '深圳市', '宝安区', '西乡', 300);
        *   add(city$area$town, '深圳市', '宝安区', '西乡', 400);
        *   add(city$area$town, '深圳市', '南山区', '后海', 500);
        *   add(city$area$town, '深圳市', '南山区', '后海', 600);
        *   add(city$area$town, '深圳市', '南山区', '前海', 700);
        * 则 
        *   city$area$town = {
        *       '深圳市': {
        *           '宝安区': {
        *               '沙井': [100, 200],
        *               '西乡': [300, 400],
        *           },
        *           '南山区': {
        *               '后海': [500, 600],
        *               '前海': [700],
        *           },
        *       },
        *   };
        */
        add(key$list, keys, item) {
            //重载 add(key$list, key0, key1, ..., keyN, item); 的形式。
            if (!Array.isArray(keys)) {
                let args = [...arguments];
                keys = args.slice(1, -1);
                item = args.slice(-1)[0]; //最后一项。
            }
    
    
            let maxIndex = keys.length - 1; //判断是否为最后一个。
            let obj = key$list;
    
            keys.forEach((key, index) => {
                let list = obj[key];
    
                if (index < maxIndex) {
                    if (!list) {
                        obj[key] = {};
                    }
    
                    obj = obj[key];
                    return;
                }
    
    
                //最后一项。
                if (!list) {
                    list = obj[key] = [];
                }
                else if (!Array.isArray(list)) {
                    //防止添加到中间节点上。
                    throw new Error(`Can not add the item to a Non-Array node.`);
                }
    
                list.push(item);
            });
    
        },
    };
});