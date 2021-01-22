/**
* src: @definejs/toast/modules/Toast/Sample.js
* pkg: @definejs/toast@1.0.1
*/
define('Toast/Sample', function (require, module, exports) { 
    
    module.exports = `
        <div id="{id}" class="definejs-toast {cssClass}" style="{style}">
            <div>
                <i id="{iconId}" class="fa fa-{icon}"></i>
            </div>
            <span id="{textId}" class="Text">{text}</span>
        </div>
    
    `;
});