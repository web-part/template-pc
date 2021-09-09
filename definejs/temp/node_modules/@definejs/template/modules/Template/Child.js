/**
* 
*/
module.exports = {
    /**
    * 根据已解析到的数据节点创建一个子级实例，并设置父子关系等。
    */
    create(Template, meta, item) {
        let name = item.name;
        let sibling = meta.name$tpl[name]; //兄弟节点。

        //检测同一级下是否已存在同名的模板。
        if (sibling) {
            throw new Error('同一级下已存在名为 `' + name + '` 的模板。');
        }

        let tpl = new Template(item);

        meta.name$tpl[name] = tpl;
        meta.parent = meta.this;    //设置父实例，内部使用的。
        tpl.parent = meta.this;     //设置父实例，外部使用的。

        tpl.on('process', function (...args) {
            meta.emitter.fire('process', args);
        });

        return tpl;

    },




};



