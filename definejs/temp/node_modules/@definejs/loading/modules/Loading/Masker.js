const Masker = require('@definejs/masker');

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