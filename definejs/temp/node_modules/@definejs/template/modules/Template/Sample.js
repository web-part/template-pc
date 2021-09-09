

const $String = require('@definejs/string');

const script = {
    begin: '<script type="text/template">',
    end: '</script>',
};

const comment = {
    begin: '<!--',
    end: '-->',
};



module.exports = exports = {
    /**
    * 替换掉子模板在父模板中的内容。
    *   sample: 父模板的内容。
    *   item: 解析到的模板数据结构。
    */
    replace(sample, item) {
        let { outerHTML, placeholder, } = item;

        if (placeholder) {
            placeholder = '{' + placeholder + '}';
        }

        sample = exports.removeScript(sample);
        sample = sample.replace(outerHTML, placeholder); //这里不要用全部替换，否则可能会误及后面的。

        return sample;
    },

    /**
    * 提取 `<!--` 和 `-->` 之间的内容作为 sample。
    */
    betweenComment(sample) {
        let { begin, end, } = comment;

        if (sample.includes(begin) &&
            sample.includes(end)) {

            sample = $String.between(sample, begin, end);   //这里用提取。
        }

        return sample;
    },

    /** 
    * 移除 html 中的 `<script type="text/template">` 和 `</script>` 标签。
    * 如果不存在 script 包裹标签，则原样返回。
    */
    removeScript(html) {
        let { begin, end, } = script;

        if (html.includes(begin) &&
            html.includes(end)) {

            html = html.split(begin).join('');   //这里用删除。
            html = html.split(end).join('');
        }

        return html;
    },

};

