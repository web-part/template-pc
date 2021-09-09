/**
* src: @definejs/dialog/modules/Dialog/Masker.js
* pkg: @definejs/dialog@1.0.4
*/
define('Dialog/Masker', function (require, module, exports) { 
    
    
    
    module.exports = {
    
        create(config) {
            let Masker = config.Masker;
    
            let defaults = {
                'container': config.container,
            };
    
            let options = Masker.normalize(defaults, config.mask); //返回一个 {} 或 null。
    
            if (!options) {
                return null;
            }
    
    
            Object.assign(options, {
                'volatile': config.volatile,
                'z-index': config['z-index'] - 1,
            });
    
    
            let masker = new Masker(options);
    
            return masker;
    
        },
    };
});