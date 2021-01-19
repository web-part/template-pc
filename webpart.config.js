

module.exports = {
    master: require('./config/master'),
    watch: require('./config/watch'),
    build: require('./config/build'),
    
    stat: require('./config/stat'),
    server: require('./config/server'),
    define: require('./config/define'),

    onRun: {
        watch: function (master) {
            master.on('init', function (website) { 
                console.log('------watch.init-----');
            });

            master.on('done', function () {
                console.log('watch.done!'.green);
            });
        },

        build: function (master) {
            master.on('init', function (website) {
                console.log('------build.init-----');
            });

            master.on('done', function () {
                console.log('build.done!'.magenta);
            });
        },
    },


};