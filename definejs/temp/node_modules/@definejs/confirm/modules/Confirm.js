/**
* 简单的 confirm 对话框。
*/
let dialog = null;
let visible = false;
let list = [];
let activeElement = null;   //上次获得焦点的元素。
let showFrom = 13;          //记录一下是否由于按下回车键导致的显示。

//创建对话框
function create() {
    let defaults = exports.defaults;
    let Dialog = defaults.Dialog;

    let dialog = new Dialog({
        'cssClass': 'definejs-Confirm',
        'volatile': defaults.volatile,
        'mask': defaults.mask,
        'autoClose': defaults.autoClose,
        'height': defaults.height,
        'z-index': defaults['z-index'],
        'buttons': defaults.buttons,
    });

    dialog.on('button', {
        ok() {
            let fn = dialog.data('ok');
            fn && fn();
        },
        cancel() {
            let fn = dialog.data('cancel');
            fn && fn();
        },
    });



    dialog.on({
        show() {
            visible = true;

            showFrom = showFrom == 13 ? 'enter' : '';

            //先暂存之前的焦点元素。
            activeElement = document.activeElement;
            activeElement.blur();

            //让 `确定` 按钮获得焦点。
            dialog.$.find('footer button').get(0).focus();
        },

        hide() {
            visible = false;

            let item = list.shift();

            if (item) {
                render(item);
            }

            //恢复之前的焦点元素。
            activeElement && activeElement.focus();
            activeElement = null;
            showFrom = '';
        },
    });

    //响应回车键
    document.addEventListener('keydown', (event) => {
        showFrom = event.keyCode;
    });

    document.addEventListener('keyup', (event) => {
        let invalid =
            event.keyCode != 13 ||  //不是回车键。
            !visible ||             //已是隐藏，避免再次触发。
            showFrom == 'enter';    //由于之前按下回车键导致的显示。

        if (invalid) {
            return;
        }

        dialog.hide();

        let fn = dialog.data('ok');
        fn && fn();
    });



    return dialog;

}


/**
*   item = {
*       text: '',
*       ok: fn,
*       cancel: fn,
*       buttons: ['确定', '取消'],
*   };
*/
function render(item) {
    dialog = dialog || create();

    dialog.data(item);

    dialog.set({
        'content': item.text,
    });

    dialog.show();

    //重新设置按钮的文本。
    let buttons = item.buttons || [];
    let defaults = exports.defaults;

    defaults.buttons.forEach(function (item, index) {
        let $btn = dialog.$.find(`button[data-index="${index}"]`);
        let text = buttons[index] || item.text;

        $btn.html(text);
    });

}


module.exports = exports = {
    /**
    * 默认配置。
    */
    defaults: require('./Confirm.defaults'),

    /**
    * 显示一个 confirm 对话框。 
    * 支持多次调用，会将多次调用加进队列，在显示完上一次后进行下一次的显示。
    * 已重载 show(opt);   //传入一个配置对象。
    * 已重载 show(text, ok);       //分开传入参数。
    *   opt = {
    *       text: '',        //要显示的消息内容。
    *       ok: fn,         //可选，点击 `确定` 按钮后要执行的回调函数。
    *       cancel: fn,     //可选，点击 `取消` 按钮后要执行的回调函数。
    *       buttons: [],    //按钮数组。
    *   };
    */
    show(text, ok) {
        let item = typeof text == 'object' ? text : { text, ok, };

        //首次显示，或之前显示的已经给隐藏了，立即显示出来。
        if (!visible) {
            render(item);
            return;
        }

        //已经是显示的，加到队列里进行排队。
        list.push(item);
    },
};


