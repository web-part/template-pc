/**
* src: @definejs/loading/modules/Loading/Presettings.js
* pkg: @definejs/loading@1.0.2
*/
define('Loading/Presettings', function (require, module, exports) { 
    
    /**
    * Loading 的预设配置。
    */
    module.exports = {
        fullscreen: {
            cssClass: 'FullScreen',
        },
    
        'scroller.pulldown': {
            sample: 'IOS',
            cssClass: 'SameLine Pulldown',
            text: '加载中...',
    
        },
    
        'scroller.pullup': {
            sample: 'IOS',
            cssClass: 'SameLine Pullup',
            text: '加载中...',
        },
    };
    
    
});