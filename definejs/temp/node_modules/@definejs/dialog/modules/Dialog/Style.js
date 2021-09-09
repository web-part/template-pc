const $Object = require('@definejs/object');
const Style = require('@definejs/style');

module.exports = {
    /**
    *
    */
    get(config) {
        let obj = $Object.filter(config, ['height', 'width', 'z-index']);
        let style = Style.objectify(config.style);

        style = Style.merge(style, obj);
        style = Style.pixelize(style, ['height', 'width',]);

        return style;

    },


};

