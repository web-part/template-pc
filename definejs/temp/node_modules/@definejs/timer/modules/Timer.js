/**
* 计时器。
*/


const mapper = new Map();
let idCounter = 0;

class Timer {
    /**
    * 构造器。
    */
    constructor() {
        let id = `definejs-Timer-${idCounter++}`;

        let meta = {
            'id': id,
            't0': 0,
            'list': [],
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
    * 开始计时。
    */
    start() {
        let meta = mapper.get(this);
        meta.t0 = new Date();
    }

    /**
    * 停止计时。
    * @param {string} unit 对时间差进行转换的单位，可取的值为：
    *   `ms`: 毫秒(默认值)。
    *   `s`: 秒。
    *   `m`: 分。
    *   `h`: 小时。
    *   `d`: 天。
    * @returns 返回一个对象，结构为 
    *   {
    *       t0: Date,       //开始时间。
    *       t1: Date,       //结束时间。
    *       dt: Number,     //时间差，即耗时，单位为毫秒。
    *       value: Number,  //针对参数 unit 传入的单位转换后的时间差值。 
    *       unit: string,   //参数 unit 传入的值。
    *   }
    */
    stop(unit = 'ms') {
        let meta = mapper.get(this);
        let t0 = meta.t0;
        let t1 = new Date();
        let dt = t1 - t0;
        let value = 0;

        let item = {
            't0': t0,
            't1': t1,
            'dt': dt,
            'value': 0,
            'unit': '',
        };

        switch (unit) {
            case 'ms':
                value = dt;
                break;
            case 's':
                value = Math.ceil(dt / 1000);
                break;
            case 'm':
                value = Math.ceil(dt / 1000 / 60);
                break;
            case 'h':
                value = Math.ceil(dt / 1000 / 3600);
                break;
            case 'd':
                value = Math.ceil(dt / 1000 / 3600 / 24);
                break;
            default:
                throw new Error(`无法识别的参数 unit，只允许是以下值之一：ms、s、m、h、d。`);
        }

        if (value) {
            item.value = value;
            item.unit = unit;
        }

        meta.list.push(item);

        return item;
    }

    /**
    * 获取所有的计时历史列表。
    */
    list() {
        let meta = mapper.get(this);
        return [...meta.list,];
    }

    /**
    * 重置计时器。
    * 会清空所有的计时历史，回到创建时的状态。
    */
    reset() { 
        let meta = mapper.get(this);

        meta.t0 = 0;
        meta.list = [];
    }
}

module.exports = Timer;