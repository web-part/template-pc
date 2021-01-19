
module.exports = {
    //此处如果不指定，则默认会使用 master 节点的。
    // 'defaults': require('./master/defaults'),
    // 'defaults.pack': require('./master/defaults.pack'),

    'watch': require('./watch/watch'),
    'watch.pack': require('./watch/watch.pack'),

};