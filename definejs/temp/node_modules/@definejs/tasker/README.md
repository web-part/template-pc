# Tasker.js

多任务串行或并行处理类。




``` javascript
const Tasker = require('@definejs/tasker');
const $Math = require('@definejs/math');

let tasker = new Tasker(['a', 'b', 'c', 'd',]);

tasker.on({
    //运行到任务列表中的每一项时触发。
    'each': function (item, index, done) {
        //产生一个指定区间的随机整数。
        let timeout = $Math.randomInt(500, 5500); 

        //模拟异步操作。
        setTimeout(() => {
            console.log(item, index, timeout);

            //必须调用传进来的 done 函数，以通知任务管理器当前项任务结束。
            //可以向 done 函数传入一个参数，任务管理器会把它们收集起来，并在 `all` 事件中的参数提供出来。
            done({item, index}); 
        }, timeout);
    },
    //全部任务完成时触发。
    'all': function (values) {
        console.log(values);
    },
});

//并行执行任务。
tasker.parallel();

//串行执行任务。
// tasker.serial();
```