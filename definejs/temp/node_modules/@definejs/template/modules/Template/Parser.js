const HTMLParser = require('@definejs/html-parser');
const Templates = require('./Parser/Templates');

module.exports = {
    /**
    *
    */
    parse(html) {
        let dom = HTMLParser.parse(html);
        let tpls = Templates.get(dom);

        return { dom, tpls, };
    },
};


