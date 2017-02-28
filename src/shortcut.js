/**
 * san-update
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file shortcut functions
 * @author otakustay
 */

import {update} from './update';

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
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {*} value 用于更新的值
 * @return {Object} 更新后的新对象
 */
export let set = (source, path, value) => update(source, buildPathObject(path, {$set: value}));

/**
 * 针对`$push`指令的快捷函数
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {*} value 用于更新的值
 * @return {Object} 更新后的新对象
 */
export let push = (source, path, value) => update(source, buildPathObject(path, {$push: value}));

/**
 * 针对`$unshift`指令的快捷函数
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {*} value 用于更新的值
 * @return {Object} 更新后的新对象
 */
export let unshift = (source, path, value) => update(source, buildPathObject(path, {$unshift: value}));

/**
 * 针对`$splice`指令的快捷函数
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
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
 * 针对`$map`指令的快捷函数
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {Function} callback 回调函数
 * @return {Object} 更新后的新对象
 */
export let map = (source, path, callback) => update(source, buildPathObject(path, {$map: callback}));

/**
 * 针对`$filter`指令的快捷函数
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {Function} callback 回调函数
 * @return {Object} 更新后的新对象
 */
export let filter = (source, path, callback) => update(source, buildPathObject(path, {$filter: callback}));

/**
 * 针对`$reduce`指令的快捷函数
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {...*} args 调用`reduce`时的参数，可以为`{Function} callback`或`{Function} callback, {*} initialValue`
 * @return {Object} 更新后的新对象
 */
export let reduce = (source, path, ...args) => {
    let command = args.length === 1 ? {$reduce: args[0]} : {$reduce: args};
    return update(source, buildPathObject(path, command));
};

/**
 * 针对`$slice`指令的快捷函数
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {number} start 起始位置
 * @param {number} end 结束位置
 * @return {Object} 更新后的新对象
 */
export let slice = (source, path, start, end) => update(source, buildPathObject(path, {$slice: [start, end]}));

/**
 * 针对`$merge`指令的快捷函数
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {*} value 用于更新的值
 * @return {Object} 更新后的新对象
 */
export let merge = (source, path, value) => update(source, buildPathObject(path, {$merge: value}));

/**
 * 针对`$defaults`指令的快捷函数
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {*} value 用于更新的值
 * @return {Object} 更新后的新对象
 */
export let defaults = (source, path, value) => update(source, buildPathObject(path, {$defaults: value}));

/**
 * 针对`$invoke`指令的快捷函数
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {Function} factory 用于生成新值的工厂函数
 * @return {Object} 更新后的新对象
 */
export let invoke = (source, path, factory) => update(source, buildPathObject(path, {$invoke: factory}));

/**
 * 针对`$omit`指令的快捷函数，其中`assert`参数默认值为`true`
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {boolean|Function} assert 用于确认是否要移除属性的判断条件或函数
 * @return {Object} 更新后的新对象
 */
export let omit = (source, path, assert = true) => update(source, buildPathObject(path, {$omit: assert}));

/**
 * 针对`$omit`指令的快捷函数，其中`assert`参数默认值为`true`
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {Function} before 包装函数，该函数会在原函数前执行，且返回值传递给原函数作为参数
 * @return {Object} 更新后的新对象
 */
export let composeBefore = (source, path, before) => update(source, buildPathObject(path, {$composeBefore: before}));

/**
 * 针对`$omit`指令的快捷函数，其中`assert`参数默认值为`true`
 *
 * @param {Object} source 待更新的对象
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {Function} after 包装函数，该函数会在原函数后执行，且接收原函数返回值作为参数
 * @return {Object} 更新后的新对象
 */
export let composeAfter = (source, path, after) => update(source, buildPathObject(path, {$composeAfter: after}));
