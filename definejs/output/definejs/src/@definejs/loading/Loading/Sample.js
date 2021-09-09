/**
* src: @definejs/loading/modules/Loading/Sample.js
* pkg: @definejs/loading@1.0.2
*/
define('Loading/Sample', function (require, module, exports) { 
    
    
    const name$sample = {
        'IOS': `
            <div id="{id}" class="definejs-Loading-ios {cssClass}" >
                <div class="Main">
                    <div class="Item-0"></div>
                    <div class="Item-1"></div>
                    <div class="Item-2"></div>
                    <div class="Item-3"></div>
                    <div class="Item-4"></div>
                    <div class="Item-5"></div>
                    <div class="Item-6"></div>
                    <div class="Item-7"></div>
                    <div class="Item-8"></div>
                    <div class="Item-9"></div>
                    <div class="Item-10"></div>
                    <div class="Item-11"></div>
                </div>
                <span id="{textId}" class="Text">{text}</span>
            </div>
        `,
    };
    
    
    /**
    *
    */
    module.exports = {
        
        get: function (name) {
            return name$sample[name] || '';
        },
    };
    
    
    
    
});