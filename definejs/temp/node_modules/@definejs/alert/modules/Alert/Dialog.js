const Height = require('./Dialog/Height');

let dialog = null;
let visible = false;
let list = [];
let activeElement = null;   //上次获得焦点的元素。
let showFrom = 13;          //记录一下是否由于按下回车键导致的显示。
let defaults = null;        //使用的是父模拟的配置，由父模块传进来。

//创建对话框。
function create() {
    let config = Object.assign({}, defaults);
    let Dialog = config.Dialog;

    let dialog = new Dialog({
        'cssClass': 'definejs-Alert',
        'volatile': config.volatile,
        'mask': config.mask,
        'autoClose': config.autoClose,
        'width': config.width,
        'z-index': config['z-index'],
        'buttons': config.buttons,
    });



    dialog.on('button', {
        ok() {
            let fn = dialog.data('fn');

            fn && fn();
        },
    });


    dialog.on({
        show() {
            visible = true;

            showFrom = showFrom == 13 ? 'enter' : '';
            activeElement = document.activeElement;
            activeElement.blur();
        },

        hide() {
            visible = false;

            let item = list.shift();

            if (item) {
                render(item.text, item.fn);
            }

            activeElement = null;
            showFrom = '';
        },
    });

    //响应回车键。

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

        let fn = dialog.data('fn');
        fn && fn();
    });

    return dialog;
}


function render(text, fn) {
    let height = Height.get(text);

    dialog = dialog || create();

    dialog.data('fn', fn);

    dialog.set({
        'content': text,
        'height': height,
    });

    dialog.show();

}


module.exports = {
    /**
    * 由父模块把默认配置传进来以供本模块使用。
    * @param {Object} defaultsData 父模块的默认配置。
    */
    init(defaultsData) {
        defaults = defaultsData;
    },

    /**
    * 把要显示的文本和要执行的回调函数加到队列里，并在特定时机显示出来。
    */
    add(text, fn) {
        //首次显示，或之前显示的已经给隐藏了，立即显示出来。
        if (!visible) {
            render(text, fn);
            return;
        }

        //已经是显示的，加到队列里进行排队。
        list.push({ text, fn, });
    },
};