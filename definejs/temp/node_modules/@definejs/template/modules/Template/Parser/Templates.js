/**
* 获取指定 template 节点的父亲 template 节点(。
*/
function getParent(tpl) {
    tpl = tpl.parentNode;

    while (tpl) {
        if (tpl.nodeName == 'template') {
            return tpl;
        }

        tpl = tpl.parentNode;
    }

    return null;
}


module.exports = {
    /**
    * 把所有的 template 节点信息提取出来。
    * 返回一个由顶层 template 节点对应的描述信息对象组成的数组。
    */
    get(dom) {
        let tpls = dom.getElementsByTagName('template');
        let tpl$item = new Map();

        let list = tpls.map(function (tpl) {
            let attributes = tpl.attributes;
            let innerHTML = tpl.innerHTML;

            let item = {
                'id': tpl.id || '',
                'name': tpl.name || '',
                'placeholder': attributes.placeholder || '',
                'innerHTML': innerHTML,
                'outerHTML': tpl.outerHTML,
                'node': tpl,
                'sample': innerHTML,
                'parent': null,
                'attributes': attributes,
                'items': [],    //直接下级列表。
            };

            tpl$item.set(tpl, item);

            return item;
        });


        let roots = list.filter(function (item) {
            let tpl = getParent(item.node);
            let parent = tpl$item.get(tpl);

            //收集根节点。
            if (!parent) {
                return true;
            }

            //顺便处理一下其它。
            item.parent = parent;
            parent.items.push(item);

            //替换掉子模板在父模板中的内容。
            let sample = parent.sample;
            let outerHTML = item.outerHTML;
            let placeholder = item.placeholder;

            if (placeholder) {
                placeholder = '{' + placeholder + '}';
            }

            parent.sample = sample.replace(outerHTML, placeholder);

        });

        return roots;
    },
};


