const $String = require('@definejs/string');

//根据文本来计算高度，大概值，并不要求很准确。
function getHeightByLength(text) {
    text = String(text);

    let len = $String.getByteLength(text);
    let h = Math.max(len, 125);
    let max = document.documentElement.clientHeight;

    if (h >= max * 0.8) {
        h = '80%';
    }


    return h;
}

//根据文本来计算高度，大概值，并不要求很准确。
function getHeightByLines(text) {
    text = String(text);

    let lines = text.split('\n');
    let h = lines.length * 25 + 60;
    let max = document.documentElement.clientHeight;

    if (h >= max * 0.8) {
        h = '80%';
    }


    return h;
}


module.exports = {
    /**
    * 根据文本获取对话框的高度。
    */
    get(text) {
        let h0 = getHeightByLength(text);
        let h1 = getHeightByLines(text);

        let h = Math.max(h0, h1);


        //保证取偶数。
        //因为奇数的高度，如 `height: 125px;`，
        //会导致 footer 的 `border-top` 变粗，暂未找到原因。
        if (typeof h == 'number') {
            h = h % 2 == 1 ? h + 1 : h;
        }

        return h;

    },
};