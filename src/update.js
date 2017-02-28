/**
 * san-update
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file update helper module
 * @author otakustay
 */

// 当指令返回这个对象的时候，说明要把这个属性移除
const OMIT_THIS_PROPERTY = {};

let clone = target => {
    let result = {};
    /* eslint-disable guard-for-in */
    for (let key in target) {
        result[key] = target[key];
    }
    /* eslint-enable guard-for-in */

    return result;
};

let find = (array, fn) => {
    for (let i = 0; i < array.length; i++) {
        let item = array[i];
        if (fn(item)) {
            return item;
        }
    }

    return undefined;
};

let notEmpty = o => {
    if (!o) {
        return false;
    }

    for (let key in o) {
        if (o.hasOwnProperty(key)) {
            return true;
        }
    }

    return false;
};

const AVAILABLE_COMMANDS = {
    $set(container, propertyName, newValue) {
        let oldValue = container[propertyName];
        if (newValue === oldValue) {
            return [newValue, null];
        }

        return [
            newValue,
            {
                $change: container.hasOwnProperty(propertyName) ? 'change' : 'add',
                oldValue: oldValue,
                newValue: newValue
            }
        ];
    },

    $push(container, propertyName, item) {
        let array = container[propertyName];

        if (!Array.isArray(array)) {
            throw new Error('Usage of $push command on non array object is forbidden.');
        }

        let newValue = array.concat([item]);
        return [
            newValue,
            {
                $change: 'change',
                oldValue: array,
                newValue: newValue,
                splice: {
                    index: array.length,
                    deleteCount: 0,
                    insertions: [item]
                }
            }
        ];
    },

    $unshift(container, propertyName, item) {
        let array = container[propertyName];

        if (!Array.isArray(array)) {
            throw new Error('Usage of $unshift command on non array object is forbidden.');
        }

        let newValue = [item].concat(array);
        return [
            newValue,
            {
                $change: 'change',
                oldValue: array,
                newValue: newValue,
                splice: {
                    index: 0,
                    deleteCount: 0,
                    insertions: [item]
                }
            }
        ];
    },

    $splice(container, propertyName, [start, deleteCount, ...items]) {
        let array = container[propertyName];

        if (!Array.isArray(array)) {
            throw new Error('Usage of $splice command on non array object is forbidden.');
        }

        let newValue = array.slice(0, start).concat(items).concat(array.slice(start + deleteCount));
        return [
            newValue,
            {
                $change: 'change',
                oldValue: array,
                newValue: newValue,
                splice: {
                    index: start,
                    deleteCount: deleteCount,
                    insertions: items
                }
            }
        ];
    },

    $map(container, propertyName, callback) {
        let array = container[propertyName];

        if (!Array.isArray(array)) {
            throw new Error('Usage of $map command on non array object is forbidden.');
        }

        let newValue = array.map(callback);
        return [
            newValue,
            {
                $change: 'change',
                oldValue: array,
                newValue: newValue
            }
        ];
    },

    $filter(container, propertyName, callback) {
        let array = container[propertyName];

        if (!Array.isArray(array)) {
            throw new Error('Usage of $filter command on non array object is forbidden.');
        }

        let newValue = array.filter(callback);
        return [
            newValue,
            {
                $change: 'change',
                oldValue: array,
                newValue: newValue
            }
        ];
    },

    $slice(container, propertyName, [begin, end]) {
        let array = container[propertyName];

        if (!Array.isArray(array)) {
            throw new Error('Usage of $slice command on non array object is forbidden.');
        }

        let newValue = array.slice(begin, end);
        return [
            newValue,
            {
                $change: 'change',
                oldValue: array,
                newValue: newValue
            }
        ];
    },

    $reduce(container, propertyName, args) {
        let array = container[propertyName];

        if (!Array.isArray(array)) {
            throw new Error('Usage of $reduce command on non array object is forbidden.');
        }

        // .reduce(callback) : .reduce(callback, initialValue)
        let newValue = typeof args === 'function' ? array.reduce(args) : array.reduce(...args);
        return [
            newValue,
            {
                $change: 'change',
                oldValue: array,
                newValue: newValue
            }
        ];
    },

    $merge(container, propertyName, extensions) {
        let target = container[propertyName] || {};
        let newValue = clone(target);
        let diff = {};
        for (let key in extensions) {
            if (extensions.hasOwnProperty(key)) {
                let newPropertyValue = extensions[key];
                let oldPropertyValue = target[key];
                if (newPropertyValue !== oldPropertyValue) {
                    newValue[key] = newPropertyValue;
                    diff[key] = {
                        $change: target.hasOwnProperty(key) ? 'change' : 'add',
                        oldValue: oldPropertyValue,
                        newValue: newPropertyValue
                    };
                }
            }
        }

        return [newValue, diff];
    },

    $defaults(container, propertyName, defaults) {
        let target = container[propertyName];
        let newValue = clone(target);
        let diff = {};
        for (let key in defaults) {
            if (defaults.hasOwnProperty(key) && newValue[key] === undefined) {
                newValue[key] = defaults[key];
                diff[key] = {
                    $change: 'add',
                    oldValue: undefined,
                    newValue: defaults[key]
                };
            }
        }

        return [newValue, diff];
    },

    $invoke(container, propertyName, factory) {
        let newValue = factory(container[propertyName]);
        return [
            newValue,
            {
                $change: container.hasOwnProperty(propertyName) ? 'change' : 'add',
                oldValue: container[propertyName],
                newValue: newValue
            }
        ];
    },

    $omit(container, propertyName, assert) {
        let value = container[propertyName];

        if (assert === true || (typeof assert === 'function' && assert(value))) {
            return [
                OMIT_THIS_PROPERTY,
                {
                    $change: 'remove',
                    oldValue: value,
                    newValue: undefined
                }
            ];
        }

        return [value, null];
    },

    $composeBefore(container, propertyName, before) {
        let fn = container[propertyName];

        if (typeof fn !== 'function') {
            throw new Error('Usage of $composeBefore command on non function object is forbidden.');
        }

        if (typeof before !== 'function') {
            throw new Error('Passing nont function object to $composeBefore command is forbidden');
        }

        let newValue = (...args) => fn(before(...args));
        return [
            newValue,
            {
                $change: 'change',
                oldValue: fn,
                newValue: newValue
            }
        ];
    },

    $composeAfter(container, propertyName, after) {
        let fn = container[propertyName];

        if (typeof fn !== 'function') {
            throw new Error('Usage of $composeAfter command on non function object is forbidden.');
        }

        if (typeof after !== 'function') {
            throw new Error('Passing nont function object to $composeAfter command is forbidden');
        }

        let newValue = (...args) => after(fn(...args));
        return [
            newValue,
            {
                $change: 'change',
                oldValue: fn,
                newValue: newValue
            }
        ];
    }
};

const AVAILABLE_COMMAND_KEYS = Object.keys(AVAILABLE_COMMANDS);

/**
 * @private
 */
export let availableCommandNames = AVAILABLE_COMMAND_KEYS.map(key => key.slice(1));

/**
 * 根据提供的指令更新一个对象，返回更新后的新对象及差异对象，原对象不会作任何的修改
 *
 * 现有支持的指令包括：
 *
 * - `$set`：修改指定的属性值
 * - `$push`：向类型为数组的属性尾部添加元素
 * - `$unshift`：向类型为数组的属性头部添加元素
 * - `$merge`：将2个对象进行浅合并（不递归）
 * - `$defaults`：将指定对象的属性值填到原属性为'undefined`的'性上
 * - `$invoke`：用一个工厂函数的返回值作为`$set`指令的输入，工厂函数接受属性的旧值作为唯一的参数
 * - `$omit`：用于移除某个属性，传递`boolean`值来确认是否移除（`true`为移除），也可传递一个函数（参数为旧值）用其返回值确认是否移除
 *
 * 可以在一次更新操作中对不同的属性用不同的指令：
 *
 * ```javascript
 * import {withDiff} from 'san-update';
 *
 * let [newObject, diff] = withDiff(
 *     source,
 *     {
 *         foo: {bar: {$set: 1}},
 *         alice: {$push: 1},
 *         tom: {jack: {$set: {x: 1}}
 *     }
 * );
 * ```
 *
 * @param {Object} source 待更新的对象
 * @param {Object} commands 用于更新的指令
 * @return {[Object, Object]} 返回一个Tuple数组，其中第1项为更新结果，第2项为差异对象
 */
export let withDiff = (source, commands) => {
    // 如果根节点就是个指令，那么直接对输入的对象进行操作，不需要再遍历属性了
    let possibleRootCommand = find(AVAILABLE_COMMAND_KEYS, key => commands.hasOwnProperty(key));
    if (possibleRootCommand) {
        let wrapper = {source};
        let commandValue = commands[possibleRootCommand];
        return AVAILABLE_COMMANDS[possibleRootCommand](wrapper, 'source', commandValue);
    }

    // ({string} key) => [newValue, diff]
    let executeCommand = key => {
        let propertyCommand = commands[key];
        let availableCommand = find(AVAILABLE_COMMAND_KEYS, key => propertyCommand.hasOwnProperty(key));

        // 找到指令节点后，对当前属性进行更新，
        // 如果这个节点不代表指令，那么肯定它的某个属性（或子属性）是指令，继续递归往下找
        return availableCommand
            ? AVAILABLE_COMMANDS[availableCommand](source, key, propertyCommand[availableCommand])
            : withDiff(source[key] || {}, propertyCommand);
    };

    // 因为可能通过指令增加一些原本没有的属性，所以最后还要对`commands`做一次遍历来确保没有漏掉
    let patchNewProperties = (result, diff) => {
        for (let key in commands) {
            if (result.hasOwnProperty(key) || !commands.hasOwnProperty(key)) {
                continue;
            }

            let [newValue, propertyDiff] = executeCommand(key);
            // 理论上因为全是新属性，所以这里的`propertyDiff`不可能是空的
            diff[key] = propertyDiff;

            if (newValue !== OMIT_THIS_PROPERTY) {
                result[key] = newValue;
            }
        }

        return [result, diff];
    };

    if (Array.isArray(source)) {
        let result = [];
        let diff = {};
        for (let i = 0; i < source.length; i++) {
            // 没有对应的指令，自然是不更新的，直接复制过去
            if (!commands.hasOwnProperty(i)) {
                result.push(source[i]);
                continue;
            }

            let [newValue, propertyDiff] = executeCommand(i);
            if (notEmpty(propertyDiff)) {
                diff[i] = propertyDiff;
            }
            if (newValue !== OMIT_THIS_PROPERTY) {
                result.push(newValue);
            }
        }

        return patchNewProperties(result, diff);
    }

    let result = {};
    let diff = {};
    for (let key in source) {
        // 没有对应的指令，自然是不更新的，直接复制过去
        if (!commands.hasOwnProperty(key)) {
            result[key] = source[key];
            continue;
        }

        let [newValue, propertyDiff] = executeCommand(key);
        if (notEmpty(propertyDiff)) {
            diff[key] = propertyDiff;
        }
        if (newValue !== OMIT_THIS_PROPERTY) {
            result[key] = newValue;
        }
    }

    return patchNewProperties(result, diff);
};

/**
 * 根据提供的指令更新一个对象，返回更新后的新对象，原对象不会作任何的修改
 *
 * 具体详情参考`withDiff`的文档
 *
 * ```javascript
 * import {update} from 'san-update';
 *
 * let newObject = withDiff(
 *     source,
 *     {
 *         foo: {bar: {$set: 1}},
 *         alice: {$push: 1},
 *         tom: {jack: {$set: {x: 1}}
 *     }
 * );
 * ```
 *
 * @param {Object} source 待更新的对象
 * @param {Object} commands 用于更新的指令
 * @return {Object} 更新后的对象
 */
export let update = (source, commands) => withDiff(source, commands)[0];
