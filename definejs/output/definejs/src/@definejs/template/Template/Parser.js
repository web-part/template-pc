/**
* src: @definejs/template/modules/Template/Parser.js
* pkg: @definejs/template@1.0.0
*/
define('Template/Parser', function (require, module, exports) { 
    const HTMLParser = require('HTMLParser');
    const Templates = module.require('Templates');
    
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
    
    
    
});