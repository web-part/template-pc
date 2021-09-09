/**
* 文件工具。
*/

const $Object = require('@definejs/object');
const SingleFile = require('./File/SingleFile');


module.exports = exports = {
    /**
    * 判断是否存在指定的一个或多个文件。
    * 已重载 exists(file);  //判断单个文件是否存在，返回 boolean 值 existed。
    * 已重载 exists(files); //判断多个文件是否存在，返回文件名映射到存在结果的对象 file$existed。
    */
    exists(file) {
        //重载 exists(files);
        //判断多个文件是否存在，返回文件名映射到存在结果的对象。
        if (Array.isArray(file)) {
            let files = file;
            let file$existed = {};

            files.forEach((file, index) => {
                file$existed[file] = SingleFile.exists(file);
            });

            return file$existed;
        }

        //重载 exists(file);
        //判断单个的情形。
        return SingleFile.exists(file);
    },

    /**
    * 读取一个文件或多个文件。
    * 可以指定使用指定的编码，否则默认为 `utf8`。
    * 已重载 read(file);            //使用 `utf8` 的编码方式读取内容。
    * 已重载 read(file, null);      //读取 buffer 形式的内容。
    * 已重载 read(file, encoding);  //使用指定的编码读取一个内容。
    * 
    * 已重载 read(files);           //使用 `utf8` 的编码方式读取多个文件内容，返回一个内容数组。
    * 已重载 read(files, null);     //读取多个文件的 buffer 形式的内容，返回一个 buffer 数组。
    * 已重载 read(files, encoding); //读取多个文件使用同一个编码，返回一个内容数组 contents。
    * 
    * 已重载 read(file$encoding);   //读取多个不同文件使用不同的编码，返回一个文件名映射到内容的对象 file$content。
    * 
    */
    read(file, encoding) {
        //重载 read(files, encoding); 的形式。
        //读取多个文件使用同一个编码，返回一个内容数组。
        if (Array.isArray(file)) {
            let files = file;

            let contents = files.map((file, index) => {
                return SingleFile.read(file, encoding);
            });

            return contents;
        }

        //重载 read(file$encoding); 的形式。
        //读取多个不同文件使用不同的编码，返回一个文件名映射到内容的对象。
        if (typeof file == 'object') {
            let file$encoding = file;
            let file$content = {};

            $Object.each(file$encoding, (file, encoding) => { 
                file$content[file] = SingleFile.read(file, encoding);
            });

            return file$content;
        }

        //读取单个文件。
        return SingleFile.read(file, encoding);

    },

    /**
    * 写入一个文件。
    * 已重载 write(file, content);              //使用 `utf8` 的编码方式写入内容，输出 log。
    * 已重载 write(file, content, null);        //使用 `utf8` 的编码方式写入内容，不输出 log。
    * 已重载 write(file, content, encoding);    //使用指定的编码写入内容，输出 log。
    * 
    * 已重载 write(file$content);               //使用 `utf8` 的编码方式写入多个文件内容，输出 log。
    * 已重载 write(file$content, null);         //使用 `utf8` 的编码方式写入多个文件内容，不输出 log。
    * 已重载 write(file$content, encoding);     //使用相同的指定的编码写入多个文件内容，输出 log。
    */
    write(file, content, encoding) {
        //重载 write(file$content, encoding); 的形式。
        //写入多个不同文件使用相同的编码，传入文件名映射到内容的对象。
        if (typeof file == 'object') {
            let encoding = content;
            let file$content = file;

            $Object.each(file$content, (file, content) => {
                SingleFile.write(file, content, encoding);
            });

            return;
        }

        //单个写入。
        SingleFile.write(file, content, encoding);
    },

    
    /**
    * 向一个文件追加内容。
    * 已重载 append(file, content);            //使用 `utf8` 的编码方式追加内容，输出 log。
    * 已重载 append(file, content, null);      //使用 `utf8` 的编码方式追加内容，不输出 log。
    * 已重载 append(file, content, encoding);  //使用指定的编码追加内容，输出 log。
    * 
    * 已重载 append(file$content);             //使用 `utf8` 的编码方式向多个文件追加内容，输出 log。
    * 已重载 append(file$content, null);       //使用 `utf8` 的编码方式向多个文件追加内容，不输出 log。
    * 已重载 append(file$content, encoding);   //使用相同的指定的编码向多个文件追加内容，输出 log。
    */
    append(file, content, encoding) {
        //重载 append(file$content, encoding); 的形式。
        //向多个不同文件追加内容，使用相同的编码，传入文件名映射到内容的对象。
        if (typeof file == 'object') {
            let encoding = content;
            let file$content = file;

            $Object.each(file$content, (file, content) => {
                SingleFile.append(file, content, encoding);
            });

            return;
        }

        //单个。
        SingleFile.append(file, content, encoding);
    },

    /**
    * 复制一个或多个文件。
    * 已重载 copy(src, dest);   //复制单个文件。
    * 已重载 copy(src$dest);    //复制多个文件。
    */
    copy(src, dest) {
        //重载 copy(src$dest); 的形式。
        //复制多个不同文件，传入源文件名映射到目标文件名的对象。
        if (typeof src == 'object') {
            let src$dest = src;

            $Object.each(src$dest, (src, dest) => {
                SingleFile.copy(src, dest);
            });

            return;
        }

        //复制单个。
        SingleFile.copy(src, dest);

    },

    /**
    * 删除一个或多个文件。
    * 已重载 delete(file);     //删除单个文件。
    * 已重载 delete(files);    //删除多个文件。
    */
    delete(file) {
        //重载 delete(files);
        //删除多个文件。
        if (Array.isArray(file)) {
            let files = file;

            files.forEach((file, index) => {
                SingleFile.delete(file);
            });

            return;
        }
        
        //删除单个。
        SingleFile.delete(file);
    },

    /**
    * 读取一个或多个 JSON 文件，解析其内容，并返回对应的对象。
    * 已重载 readJSON(file);    //读取单个文件，返回 JSON 对象。
    * 已重载 readJSON(files);   //读取多个文件，返回文件名映射到 JSON 的对象 file$json。
    */
    readJSON(file) {
        //重载 readJSON(files); 
        //读取多个 JSON 文件，返回文件名映射到 JSON 的对象。
        if (Array.isArray(file)) {
            let files = file;
            let file$json = {};

            files.forEach((file, index) => {
                file$json[file] = SingleFile.readJSON(file);
            });

            return file$json;
        }

        return SingleFile.readJSON(file);
        
    },

    /**
    * 写入一个或多个 JSON 文件。
    * 可以指定是否压缩。
    * 已重载 writeJSON(file, json);         //使用普通的方式写入一个 JSON 文件。
    * 已重载 writeJSON(file, json, minify); //使用指定的压缩方式写入一个 JSON 文件。
    * 已重载 writeJSON(file$json);          //使用普通的方式写入多个 JSON 文件。
    * 已重载 writeJSON(file$json, minify);  //使用指定的压缩方式写入多个 JSON 文件。
    * @param {string} file 必选，要写入的目标 JSON 文件路径。
    * @param {Object|Array} json 必选，要写入的数据。
    * @param {boolean} minify 可选，指定是否压缩。
    */
    writeJSON(file, json, minify) {
        //重载 writeJSON(file$json, minify); 的形式。
        //写入多个不同文件使用相同的压缩/不压缩方式，传入文件名映射到 JSON 对象的对象。
        if (typeof file == 'object') {
            let minify = json;
            let file$json = file;

            $Object.each(file$json, (file, json) => {
                SingleFile.writeJSON(file, json, minify);
            });

            return;
        }

        SingleFile.writeJSON(file, json, minify);

    },

    

    /**
    * 对传入的对象或数组进行排序后写入 JSON 文件。
    * @param {string} file 必选，要写入的目标 JSON 文件路径。
    * @param {Object|Array} data 必选，要写入的对象或数组数据。
    * @param {function} sort 可选，排序方法。 如果要指定自定义的排序算法，请提供一个函数。 否则使用默认的排序算法。
    */
    writeSortJSON(file, data, sort) {
        //数组。
        if (Array.isArray(data)) {
            let list = data.sort(sort);

            exports.writeJSON(file, list);
            return;
        }

        if (typeof data != 'object' || !data) {
            throw new Error(`参数 data 必须为一个对象或数组。`);
        }


        let json = {};
        let keys = Object.keys(data).sort(sort);

        keys.forEach((key) => {
            let value = data[key];

            //值为数组的，继续排序。
            if (Array.isArray(value)) {
                value = value.sort(sort);
            }

            json[key] = value;
        });

        exports.writeJSON(file, json);
    },


};

