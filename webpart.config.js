
module.exports = {
    console: require('./config/console'),
    master: require('./config/master'),

    parse: require('./config/parse'),
    compile: require('./config/watch'), //它用的是 watch 的配置。
    watch: require('./config/watch'),
    build: require('./config/build'),

    stat: require('./config/stat'),
    server: require('./config/server'),

    masterEvents: {
        'init': function (website) {
            console.log('------init-----');
        },

        'done': {
            'compile': function (website) {
                console.log('compile.done!'.green);
            },
            'watch': function (website) {
                console.log('watch.done!'.green);
            },
            'build': function (website) {
                console.log('build.done!'.green);
            },
        },
    },



};