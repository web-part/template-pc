/**
* src: @definejs/navigator/modules/Navigator/Hash.js
* pkg: @definejs/navigator@1.0.0
*/
define('Navigator/Hash', function (require, module, exports) { 
    
    const Hash = require('Hash'); //这里用浏览器版本的。
    
    
    module.exports = {
        /**
        * 
        */
        init(meta) {
            let emitter = meta.emitter;
    
    
            //监听窗口 hash 的变化。
            Hash.onchange(window, true, function (hash, old, isImmediate) {
                //
                meta.hash = hash;
    
                //已禁用。
                //此值可给动态改变，因此需要每次都判断。
                if (!meta.enabled) {
                    return;
                }
    
                //此次已临时禁用事件。
                if (!meta.fireEvent) {
                    meta.fireEvent = true; //恢复启用事件，供下次使用。
                    return;
                }
    
    
                if (isImmediate) {
                    emitter.fire('immediate', [hash, meta.hash$info]);
                }
    
                //空值。
                if (!hash) {
                    old = meta.router.toView(old);
                    emitter.fire('none', [old]);
                    return;
                }
    
    
                //通过点击前进/后退按钮(或调用浏览器的前进/后退接口)，
                //或在地址栏中手动输入 hash 导致的变化。
                //此时 hash 值肯定非空(因为如果为空，前面就已拦截了)。
                let target = meta.hash$info[hash];   //可能为空。
                let current = meta.hash$info[old];   //可能为空。
    
                if (target) {
                    let cache = true;
    
                    //优先用指定的。
                    if ('cache' in target) {
                        cache = target.cache;
                        delete target.cache;    //一次性的，用完即删。
                    }
    
                    emitter.fire('view', [target.view, target.args, {
                        'target': target,
                        'current': current,
                        'cache': cache,
                    }]);
    
                    if (current) {
                        let direction = target.timestamp > current.timestamp ? 'forward' : 'back';
    
                        emitter.fire(direction, [current.view, target.view]);
                    }
                    return;
                }
    
    
                hash = meta.router.toView(hash);
                old = meta.router.toView(old);
    
                //说明页面一进来时，地址栏中就含有了 hash。
                if (isImmediate) {
                    emitter.fire('start', [hash, old]);
                }
                else {
                    emitter.fire('404', [hash, old]);
                }
    
            });
        },
    
        /**
        * 
        */
        set(hash) {
            Hash.set(window, hash);
        },
    };
});