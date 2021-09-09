# Defaults.js

此包仅供自动化打包工具 `@definejs/packer` 使用。  
不能单独使用，因为它依赖 `@definejs/packer` 中一个变量 `InnerMM`。  
由打包工具把其它模块和本模块打包成一个独立的库时，需要用到本模块。  
本模块用于充当 `@definejs/` 内部模块使用的默认配置管理器。   
