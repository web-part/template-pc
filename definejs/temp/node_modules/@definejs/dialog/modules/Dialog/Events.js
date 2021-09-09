const $ = require('jquery');


module.exports = {

    bind(meta) {
        //监控 masker 层的隐藏。
        if (meta.masker && meta.volatile) {
            meta.masker.on({
                'show'() {

                },
                'hide'() {
                    meta.this.hide();
                },
            });
        }


        //底部按钮。
        (function () {
            if (!meta.buttons.length) {
                return;
            }

            let $footer = meta.$footer;
            let eventName = meta.eventName;
            let selector = 'button[data-index]';
            let pressed = meta.pressedClass;

            //移动端。
            if (eventName == 'touch') {
                $footer.touch(selector, handler, pressed);
                return;
            }

            //PC 端。
            $footer.on(eventName, selector, handler); //如 on('click', selector);

            $footer.on('mousedown', selector, function (event) {
                $(this).addClass(pressed);
            });

            $footer.on('mouseup mouseout', selector, function (event) {
                $(this).removeClass(pressed);
            });


            //内部共用的处理器。
            function handler(event) {
                let button = this;
                let index = +button.getAttribute('data-index');
                let item = meta.buttons[index];
                let cmd = item.cmd || String(index);
                let fn = item.fn;

                fn && fn(item, index);

                meta.emitter.fire('button', cmd, [item, index]);
                meta.emitter.fire('button', [item, index]);


                // item.autoClose 优先级高于 meta.autoClose。
                let autoClose = item.autoClose;

                if (autoClose === undefined) {
                    autoClose = meta.autoClose;
                }

                if (autoClose) {
                    meta.this.hide();
                }
            }

        })();



    },
};