/**
 * san-update
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file functional programming module
 * @author otakustay
 */

import * as shortcut from './shortcut';

let wrap = fn => (...args) => source => fn(source, ...args);

/**
 * 构建一个针对`$set`指令的更新函数
 *
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {*} value 用于更新的值
 * @return {Function} 返回更新函数，该函数接收对象后依据指令进行更新并返回新对象
 */
export let set = wrap(shortcut.set);

/**
 * 构建一个针对`$push`指令的更新函数
 *
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {*} value 用于更新的值
 * @return {Function} 返回更新函数，该函数接收对象后依据指令进行更新并返回新对象
 */
export let push = wrap(shortcut.push);

/**
 * 构建一个针对`$unshift`指令的更新函数
 *
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {*} value 用于更新的值
 * @return {Function} 返回更新函数，该函数接收对象后依据指令进行更新并返回新对象
 */
export let unshift = wrap(shortcut.unshift);

/**
 * 构建一个针对`$pop`指令的更新函数
 *
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {boolean|Function} assert 用于确认是否要移除属性的判断条件或函数
 * @return {Function} 返回更新函数，该函数接收对象后依据指令进行更新并返回新对象
 */
export let pop = wrap(shortcut.pop);

/**
 * 构建一个针对`$shift`指令的更新函数
 *
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {boolean|Function} assert 用于确认是否要移除属性的判断条件或函数
 * @return {Function} 返回更新函数，该函数接收对象后依据指令进行更新并返回新对象
 */
export let shift = wrap(shortcut.shift);

/**
 * 构建一个针对`$removeAt`指令的更新函数
 *
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {number} index 需要删除的索引
 * @return {Function} 返回更新函数，该函数接收对象后依据指令进行更新并返回新对象
 */
export let removeAt = wrap(shortcut.removeAt);

/**
 * 构建一个针对`$remove`指令的更新函数
 *
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {*} value 需要删除的值
 * @return {Function} 返回更新函数，该函数接收对象后依据指令进行更新并返回新对象
 */
export let remove = wrap(shortcut.remove);

/**
 * 构建一个针对`$splice`指令的更新函数
 *
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {number} start 插入起始位置
 * @param {number} deleteCount 删除的元素个数
 * @param {...*} items 插入的元素
 * @return {Function} 返回更新函数，该函数接收对象后依据指令进行更新并返回新对象
 */
export let splice = wrap(shortcut.splice);

/**
 * 构建一个针对`$map`指令的更新函数
 *
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {Function} callback 回调函数
 * @return {Function} 返回更新函数，该函数接收对象后依据指令进行更新并返回新对象
 */
export let map = wrap(shortcut.map);

/**
 * 构建一个针对`$filter`指令的更新函数
 *
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {Function} callback 回调函数
 * @return {Function} 返回更新函数，该函数接收对象后依据指令进行更新并返回新对象
 */
export let filter = wrap(shortcut.filter);

/**
 * 构建一个针对`$reduce`指令的更新函数
 *
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {...*} args 调用`reduce`时的参数，可以为`{Function} callback`或`{Function} callback, {*} initialValue`
 * @return {Function} 返回更新函数，该函数接收对象后依据指令进行更新并返回新对象
 */
export let reduce = wrap(shortcut.reduce);

/**
 * 构建一个针对`$merge`指令的更新函数
 *
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {*} value 用于更新的值
 * @return {Function} 返回更新函数，该函数接收对象后依据指令进行更新并返回新对象
 */
export let merge = wrap(shortcut.merge);

/**
 * 构建一个针对`$defaults`指令的更新函数
 *
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {*} value 用于更新的值
 * @return {Function} 返回更新函数，该函数接收对象后依据指令进行更新并返回新对象
 */
export let defaults = wrap(shortcut.defaults);

/**
 * 构建一个针对`$apply`指令的更新函数
 *
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {Function} factory 用于生成新值的工厂函数
 * @return {Function} 返回更新函数，该函数接收对象后依据指令进行更新并返回新对象
 */
export let apply = wrap(shortcut.apply);

/**
 * 构建一个针对`$omit`指令的更新函数
 *
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {boolean|Function} assert 用于确认是否要移除属性的判断条件或函数
 * @return {Function} 返回更新函数，该函数接收对象后依据指令进行更新并返回新对象
 */
export let omit = wrap(shortcut.omit);

/**
 * 构建一个针对`$omit`指令的更新函数
 *
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {Function} before 包装函数，该函数会在原函数前执行，且返回值传递给原函数作为参数
 * @return {Function} 返回更新函数，该函数接收对象后依据指令进行更新并返回新对象
 */
export let composeBefore = wrap(shortcut.composeBefore);

/**
 * 构建一个针对`$omit`指令的更新函数
 *
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组，
 *     如果该参数为'undefined`或`null`，则会直接对`source`对象进行更'操作
 * @param {Function} after 包装函数，该函数会在原函数后执行，且接收原函数返回值作为参数
 * @return {Function} 返回更新函数，该函数接收对象后依据指令进行更新并返回新对象
 */
export let composeAfter = wrap(shortcut.composeAfter);

/**
 * 构建一个针对`applyWith`快捷函数的更新对象
 *
 * 此函数在`update`函数时不能使用此指令
 *
 * 此函数必须指定`path`参数，不能直接对对象本身使用
 *
 * @param {string?|Array.<string>|number?|Array.<number>} path 属性的路径，如果更新二层以上的属性则需要提供一个字符串数组
 * @param {Function|Array.<Function>} selectors 用于获取`factory`的依赖参数的函数，每个函数返回一个值作为`factory`的参数
 * @param {Function} factory 用于生成新值的工厂函数，该函数前n个参数是`selectors`参数的返回值，最后一个参数为需要更新的属性的当前值
 * @return {Function} 返回更新函数，该函数接收对象后依据指令进行更新并返回新对象
 */
export let applyWith = wrap(shortcut.applyWith);
