/**
* src: @definejs/loading/modules/Loading/Masker.js
* pkg: @definejs/loading@1.0.2
*/
define('Loading/Masker', function (require, module, exports) { 
    const Masker = require('Masker');
    
    module.exports = {
    
        create(config) {
            let defaults = {
                'container': config.container,
            };
    
            let options = Masker.normalize(defaults, config.mask); //返回一个 {} 或 null。
    
            if (!options) {
                return null;
            }
    
            let masker = new Masker(options);
            let zIndex = config['z-index'] - 1;
    
            masker.on('render', function () {
                masker.$.css({
                    'z-index': zIndex,
                });
            });
    
            return masker;
    
        },
    };
});