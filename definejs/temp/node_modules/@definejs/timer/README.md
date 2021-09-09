# Timer.js

计时器。

## 示例

``` javascript
const Timer = require('@definejs/timer');
const timer = new Timer();

timer.start();

setTimeout(() => {
    //等同于：
    //let info = timer.stop('ms');
    let info = timer.stop();        //停止计时，并以毫秒为单位对耗时进行转换。
    

    console.log(info);

}, 3000);


setTimeout(() => {
    let info = timer.stop('m'); //停止计时，并以分钟为单位对耗时进行转换。
    let list = timer.list();    //获取所有的计时历史，返回一个数组。

    console.log(info);
    console.log(list);  

}, 61*1000);

```

## 方法

### start()

开始计时。

### stop(unit = 'ms')

停止计时，返回计时的相关信息，并保存到计时历史列表中。

#### 参数
##### unit 

类型：string。   
对时间差进行转换的单位，可取的值为：  
 - `ms`: 毫秒(默认值)。
 - `s`: 秒。
 - `m`: 分。
 - `h`: 小时。
 - `d`: 天。

#### 返回值
返回的计时信息结构为：  
``` javascript
{ 
    t0: Date,       //开始时间，Date 实例。
    t1: Date,       //结束时间，Date 实例。
    dt: Number,     //时间差，即耗时，单位为毫秒。
    value: Number,  //针对参数 unit 传入的单位转换后的时间差值向上取整的整数。 
    unit: string,   //参数 unit 传入的值。
}
```

### reset()

重置计时器，回到创建时的状态，会清空计时历史列表。

### list()

获取所有的历史计时列表信息，返回一个数组。


