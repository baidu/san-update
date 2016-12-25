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
    if (Array.isArray(target)) {
        return target.slice();
    }

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

const AVAILABLE_COMMANDS = {
    $set(container, propertyName, newValue) {
        return newValue;
    },

    $push(container, propertyName, newValue) {
        let array = container[propertyName];

        if (!Array.isArray(array)) {
            console.warn('Usage of $push command on non array object may produce unexpected result.');
        }

        return array.concat([newValue]);
    },

    $unshift(container, propertyName, newValue) {
        let array = container[propertyName];

        if (!Array.isArray(array)) {
            console.warn('Usage of $unshift command on non array object may produce unexpected result.');
        }

        return [newValue].concat(array);
    },

    $splice(container, propertyName, [start, deleteCount, ...items]) {
        let array = container[propertyName];

        if (!Array.isArray(array)) {
            console.warn('Usage of $splice command on non array object may produce unexpected result.');
        }

        return array.slice(0, start).concat(items).concat(array.slice(start + deleteCount));
    },

    $merge(container, propertyName, extensions) {
        let target = container[propertyName];
        if (target == null) {
            return clone(extensions);
        }

        let newValue = clone(target);
        for (let key in extensions) {
            if (extensions.hasOwnProperty(key)) {
                newValue[key] = extensions[key];
            }
        }

        return newValue;
    },

    $defaults(container, propertyName, defaults) {
        let target = container[propertyName];

        let newValue = clone(target);
        for (let key in defaults) {
            if (defaults.hasOwnProperty(key) && newValue[key] === undefined) {
                newValue[key] = defaults[key];
            }
        }

        return newValue;
    },

    $invoke(container, propertyName, factory) {
        return factory(container[propertyName]);
    },

    $omit(container, propertyName, assert) {
        let value = container[propertyName];

        if (assert === true || (typeof assert === 'function' && assert(value))) {
            return OMIT_THIS_PROPERTY;
        }

        return value;
    }
};

const AVAILABLE_COMMAND_KEYS = Object.keys(AVAILABLE_COMMANDS);

export let availableCommandNames = AVAILABLE_COMMAND_KEYS.map(key => key.slice(1));

/**
 * 根据提供的指令更新一个对象，返回更新后的新对象，原对象不会作任何的修改
 *
 * 现有支持的指令包括：
 *
 * - `$set`：修改指定的属性值
 * - `$push`：向类型为数组的属性尾部添加元素
 * - `$unshift`：向类型为数组的属性头部添加元素
 * - `$merge`：将2个对象进行浅合并（不递归）
 * - `$defaults`：将指定对象的属性值填到原属性为`undefined`的属性上
 * - `$invoke`：用一个工厂函数的返回值作为`$set`指令的输入，工厂函数接受属性的旧值作为唯一的参数
 * - `$omit`：用于移除某个属性，传递`boolean`值来确认是否移除（`true`为移除），也可传递一个函数（参数为旧值）用其返回值确认是否移除
 *
 * 可以在一次更新操作中对不同的属性用不同的指令：
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
 * @return {Object} 更新后的新对象
 */
let update = (source, commands) => {
    // 如果根节点就是个指令，那么直接对输入的对象进行操作，不需要再遍历属性了
    let possibleRootCommand = find(AVAILABLE_COMMAND_KEYS, key => commands.hasOwnProperty(key));
    if (possibleRootCommand) {
        let wrapper = {source};
        let commandValue = commands[possibleRootCommand];
        return AVAILABLE_COMMANDS[possibleRootCommand](wrapper, 'source', commandValue);
    }

    let executeCommand = key => {
        let propertyCommand = commands[key];
        let availableCommand = find(AVAILABLE_COMMAND_KEYS, key => propertyCommand.hasOwnProperty(key));

        // 找到指令节点后，对当前属性进行更新，
        // 如果这个节点不代表指令，那么肯定它的某个属性（或子属性）是指令，继续递归往下找
        let newValue = availableCommand
            ? AVAILABLE_COMMANDS[availableCommand](source, key, propertyCommand[availableCommand])
            : update(source[key] || {}, propertyCommand);

        return newValue;
    };

    // 因为可能通过指令增加一些原本没有的属性，所以最后还要对`commands`做一次遍历来确保没有漏掉
    let patchNewProperties = result => {
        for (let key in commands) {
            if (result.hasOwnProperty(key) || !commands.hasOwnProperty(key)) {
                continue;
            }

            let newValue = executeCommand(key);

            if (newValue !== OMIT_THIS_PROPERTY) {
                result[key] = newValue;
            }
        }

        return result;
    };

    if (Array.isArray(source)) {
        let result = [];
        for (let i = 0; i < source.length; i++) {
            // 没有对应的指令，自然是不更新的，直接复制过去
            if (!commands.hasOwnProperty(i)) {
                result.push(source[i]);
                continue;
            }

            let newValue = executeCommand(i);
            if (newValue !== OMIT_THIS_PROPERTY) {
                result.push(newValue);
            }
        }

        return patchNewProperties(result);
    }

    let result = {};
    for (let key in source) {
        // 没有对应的指令，自然是不更新的，直接复制过去
        if (!commands.hasOwnProperty(key)) {
            result[key] = source[key];
            continue;
        }

        let newValue = executeCommand(key);
        if (newValue !== OMIT_THIS_PROPERTY) {
            result[key] = newValue;
        }
    }

    return patchNewProperties(result);
};

export default update;

function buildPathObject(path, value) {
    if (path == null) {
        return value;
    }

    if (!Array.isArray(path)) {
        path = [path];
    }

    let result = {};
    let current = result;
    for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]] = {};
    }
    current[path[path.length - 1]] = value;
    return result;
}

/**
 * 针对`$set`指令的快捷函数
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为`undefined`或`null`，则会直接对`source`对象进行更新操作
 * @param {*} value 用于更新的值
 * @return {Object} 更新后的新对象
 */
export let set = (source, path, value) => update(source, buildPathObject(path, {$set: value}));

/**
 * 针对`$push`指令的快捷函数
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为`undefined`或`null`，则会直接对`source`对象进行更新操作
 * @param {*} value 用于更新的值
 * @return {Object} 更新后的新对象
 */
export let push = (source, path, value) => update(source, buildPathObject(path, {$push: value}));

/**
 * 针对`$unshift`指令的快捷函数
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为`undefined`或`null`，则会直接对`source`对象进行更新操作
 * @param {*} value 用于更新的值
 * @return {Object} 更新后的新对象
 */
export let unshift = (source, path, value) => update(source, buildPathObject(path, {$unshift: value}));

/**
 * 针对`$splice`指令的快捷函数
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为`undefined`或`null`，则会直接对`source`对象进行更新操作
 * @param {number} start 插入起始位置
 * @param {number} deleteCount 删除的元素个数
 * @param {...*} items 插入的元素
 * @return {Object} 更新后的新对象
 */
export let splice = (source, path, start, deleteCount, ...items) => {
    let args = [start, deleteCount, ...items];
    return update(source, buildPathObject(path, {$splice: args}));
};

/**
 * 针对`$merge`指令的快捷函数
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为`undefined`或`null`，则会直接对`source`对象进行更新操作
 * @param {*} value 用于更新的值
 * @return {Object} 更新后的新对象
 */
export let merge = (source, path, value) => update(source, buildPathObject(path, {$merge: value}));

/**
 * 针对`$defaults`指令的快捷函数
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为`undefined`或`null`，则会直接对`source`对象进行更新操作
 * @param {*} value 用于更新的值
 * @return {Object} 更新后的新对象
 */
export let defaults = (source, path, value) => update(source, buildPathObject(path, {$defaults: value}));

/**
 * 针对`$invoke`指令的快捷函数
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为`undefined`或`null`，则会直接对`source`对象进行更新操作
 * @param {Function} factory 用于生成新值的工厂函数
 * @return {Object} 更新后的新对象
 */
export let invoke = (source, path, factory) => update(source, buildPathObject(path, {$invoke: factory}));

/**
 * 针对`$omit`指令的快捷函数，其中`assert`参数默认值为`true`
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为`undefined`或`null`，则会直接对`source`对象进行更新操作
 * @param {boolean|Function} assert 用于确认是否要移除属性的判断条件或函数
 * @return {Object} 更新后的新对象
 */
export let omit = (source, path, assert = true) => update(source, buildPathObject(path, {$omit: assert}));
