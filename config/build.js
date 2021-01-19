
module.exports = {
    //此处如果不指定，则默认会使用 master 节点的。
    // 'defaults': require('./master/defaults'),
    // 'defaults.pack': require('./master/defaults.pack'),

    
    'build': require('./build/build'),
    'build.pack': require('./build/build.pack'),

    'build.compat': require('./build/build.compat'),
    'build.normal': require('./build/build.normal'),

};