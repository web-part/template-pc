# SessionStorage.js



针对应用层可以保持数据类型的会话存储工具类。

sessionStorage 属性允许你访问一个 session Storage 对象。
它与 localStorage 相似，不同之处在于 localStorage 里面存储的数据没有过期时间设置，
而存储在 sessionStorage 里面的数据在页面会话结束时会被清除。
页面会话在浏览器打开期间一直保持，并且重新加载或恢复页面仍会保持原来的页面会话。
在新标签或窗口打开一个页面会初始化一个新的会话，这点和 session cookies 的运行方式不同。
应该注意的是，无论是 localStorage 还是 sessionStorage 中保存的数据都仅限于该页面的协议。

此处的 SessionStorage 设计理念为：
  SessionStorage 是针对多个应用的存储，每个应用都有自己独立的存储空间。
  使用之前，一个应用请先配置应用的名称(通过配置 `SessionStorage` 模块的 `name` 字段)。
  为防止跟别的应用名称冲突，可以加一些随机数，如当前应用名称为 `kis-cloud`，则可以配置为 `kis-cloud-9DCA`。
  通过应用的名称来区分每个应用的独立的存储空间。
  在每个应用中，又可以创建多个 id 不同的 SessionStorage 的实例，每个 SessionStorage 实例都有自己的存储空间。
  每个 SessionStorage 实例中可以储存不同的 key 和 value。
  因此，从层级上来说，结构为：web 应用 -> SessionStorage 实例 -> 键值。

