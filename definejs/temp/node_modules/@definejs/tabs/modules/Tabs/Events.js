const $ = require('jquery');

module.exports = {
    /**
    * 
    */
    bind(meta) {
        let { eventName, selector, pressedClass, } = meta;

        meta.change = function (event) {
            let target = this;

            //每次都重新获取列表。
            //因为可能会动态添加或删除了子节点。
            let items = meta.$.find(selector).toArray();

            let index = items.findIndex(function (item) {
                return item === target;
            });

            meta.this.active(index, { event, });
        };

        //针对移动端的。
        if (eventName == 'touch') { //特殊处理
            meta.$.touch(selector, meta.change, pressedClass);
            return;
        }


        //针对 PC 端的。
        meta.$.on(eventName, selector, meta.change);

        meta.$.on('mousedown', selector, function (event) {
            $(this).addClass(pressedClass);
        });

        meta.$.on('mouseup mouseout', selector, function (event) {
            $(this).removeClass(pressedClass);
        });
    },

};


