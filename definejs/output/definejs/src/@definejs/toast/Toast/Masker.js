/**
* src: @definejs/toast/modules/Toast/Masker.js
* pkg: @definejs/toast@1.0.2
*/
define('Toast/Masker', function (require, module, exports) { 
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
    
            Object.assign(options, {
                'z-index': config['z-index'] - 1,
            });
    
            let masker = new Masker(options);
    
    
            return masker;
    
        },
    };
});