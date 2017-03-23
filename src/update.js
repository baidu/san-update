/**
 * san-update
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file update helper module
 * @author otakustay
 */

import {find, notEmpty} from './util';
import {availableCommands, availableCommandKeys, OMIT_THIS_PROPERTY} from './command';

/**
 * 根据提供的指令更新一个对象，返回更新后的新对象及差异对象，原对象不会作任何的修改
 *
 * 现有支持的指令包括：
 *
 * - `$set`：修改指定的属性值
 * - `$push`：向类型为数组的属性尾部添加元素
 * - `$unshift`：向类型为数组的属性头部添加元素
 * - `$pop`：移除类型为数组的属性的尾部元素
 * - `$shift`：移除类型为数组的属性的头部元素
 * - `$removeAt`：移除类型为数组的属性的指定位置的元素
 * - `$remove`：移除类型为数组的属性的指定元素，使用`===`判等且仅移除第一个遇到的元素
 * - `$splice`：通过索引、移除数目、插入元素操作类型为数组的属性
 * - `$map`：对类型为数组的属性进行`map`操作
 * - `$filter`：对类型为数组的属性进行`filter`操作
 * - `$reduce`：对类型为数组的属性进行`reduce`操作
 * - `$merge`：将2个对象进行浅合并（不递归）
 * - `$defaults`：将指定对象的属性值填到原属性为'undefined`的'性上
 * - `$apply`：用一个工厂函数的返回值作为`$set`指令的输入，工厂函数接受属性的旧值作为唯一的参数
 * - `$omit`：用于移除某个属性，传递`boolean`值来确认是否移除（`true`为移除），也可传递一个函数（参数为旧值）用其返回值确认是否移除
 * - `$composeBefore`：组合类型为函数的属性为一个新的函数，新函数首先调用compose提供的函数，随后调用原函数
 * - `$composeAfter`：组合类型为函数的属性为一个新的函数，新函数首先调用原函数，随后调用compose提供的函数
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
    let possibleRootCommand = find(availableCommandKeys, key => commands.hasOwnProperty(key));
    if (possibleRootCommand) {
        let wrapper = {source};
        let commandValue = commands[possibleRootCommand];
        return availableCommands[possibleRootCommand](wrapper, 'source', commandValue);
    }

    // ({string} key) => [newValue, diff]
    let executeCommand = key => {
        let propertyCommand = commands[key];
        let availableCommand = find(availableCommandKeys, key => propertyCommand.hasOwnProperty(key));

        // 找到指令节点后，对当前属性进行更新，
        // 如果这个节点不代表指令，那么肯定它的某个属性（或子属性）是指令，继续递归往下找
        return availableCommand
            ? availableCommands[availableCommand](source, key, propertyCommand[availableCommand])
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
