const Emitter = require('@definejs/emitter');

const mapper = new Map();
const sid$todos = {};
let idCounter = 0;

class Tasker {
    /**
    * 构造器。
    * @param {Array} [list] 任务列表。
    */
    constructor(list) {
        let id = `definejs-Tasker-${idCounter++}`;

        let meta = {
            'id': id,
            'emitter': new Emitter(this),
            'list': list || [],
        };

        mapper.set(this, meta);

        Object.assign(this, {
            'id': meta.id,
        });
    }

    // /**
    // * 当前实例的 id。
    // */
    // id = ''

    /**
    * 并行处理。
    * @param {Array} [list] 要处理的任务列表。 
    *   如果不指定，则使用构造器中的。
    */
    parallel(list) {
        let meta = mapper.get(this);
        list = list || meta.list;

        //空的任务列表。
        if (!list.length) {
            meta.emitter.fire('all', [[]]); //里面要套个空数组。
            return;
        }

        //非空的任务列表。
        let total = list.length;        //总项数。
        let count = total;              //待处理的项数。
        let values = new Array(total);  //收集每项异步操作的返回值。
        let dones = new Array(total);   //[true, undefined, true, ..., ] 记录对应的项是否已完成。

        list.forEach(function (item, index) {
            //done(index) 是异步调用，要多一层闭包。
            (function (index) {
                //第三个参数是一个回调函数，即 done(value); 
                //由业务层调用，以通知异步操作完成。
                //done(value); 接受一个参数作为此项异步操作的返回值进行收集，
                //最后会在全部完成后一起传过去给业务层。
                meta.emitter.fire('each', [item, index, function (value) {
                    values[index] = value; //需要收集的值，由调用者传入。
                    dones[index] = true;
                    count--;

                    //计数为 0 时，不一定就全部完成了，
                    //因为调用者可能会恶意多次调用 done() 以使计数减少到 0。
                    //但有一点可以肯定的：只要计数不为 0，说明至少有一项未完成。
                    if (count > 0) { //性能优化
                        return;
                    }

                    //安全起见，检查每项的完成状态。
                    for (let i = 0; i < total; i++) {
                        if (!dones[i]) {
                            return;
                        }
                    }

                    //至此，全部项都已完成。
                    meta.emitter.fire('all', [values]);
                }]);

            })(index);

        });
    }

    /**
    * 串行处理。
    * @param {Array} [list] 要处理的任务列表。 
    *   如果不指定，则使用构造器中的。
    */
    serial(list) {
        let meta = mapper.get(this);
        list = list || meta.list;


        //空的任务列表。
        if (!list.length) {
            meta.emitter.fire('all', []);
            return;
        }

        //非空的任务列表。
        let total = list.length;        //总项数。
        let values = new Array(total);  //收集每项异步操作的返回值。


        function process(index) {
            let item = list[index];

            //第三个参数是一个回调函数，即 done(value); 
            //由业务层调用，以通知异步操作完成。
            //done(value); 接受一个参数作为此项异步操作的返回值进行收集，
            //最后会在全部完成后一起传过去给业务层。
            meta.emitter.fire('each', [item, index, function (value) {
                values[index] = value; //需要收集的值，由调用者传入。
                index++;

                if (index < total) {
                    process(index);
                }
                else {
                    meta.emitter.fire('all', [values]);
                }
            }]);
        }

        process(0);

    }

    /**
    * 绑定事件。
    */
    on(...args) {
        let meta = mapper.get(this);
        meta.emitter.on(...args);
    }


    
 

}

//静态成员。
Object.assign(Tasker, {
    /**
    * 支持多个并发异步加载操作，实际只会加载一次。
    * 如果在加载过程中，再发起加载请求，则会放入待办列表中，加载完成后再依次执行。
    * @param {String} sid 异步加载的名称，以此作为区分。 同一个名称的拥有同一个待办队列。
    * @param {*} todo 要添加的待办项，可以是任意值。
    * @param {function} load 实际要发起的异步加载操作函数。 异步加载函数体内必须显式调用传过去的函数，以调用异步加载完成。
    */
    todo(sid, todo, load) {
        let todos = sid$todos[sid];

        if (todos) {
            todos.push(todo);
            return;
        }


        todos = sid$todos[sid] = [todo];

        load(function (each) {
            sid$todos[sid] = null;

            if (typeof each == 'function') {
                todos.forEach(function (todo, index) {
                    each(todo, index);
                });
            }

            return todos;
        });
    }
});


module.exports = Tasker;