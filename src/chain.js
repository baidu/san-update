/**
 * san-update
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file chainning wrap
 * @author otakustay
 */

import {update, withDiff} from './update';
import {availableCommandNames} from './command';
import {merge} from './shortcut';

const EMPTY_COMMANDS = {};

let createUpdater = (value, commands) => availableCommandNames.reduce(
    (updater, shortcut) => {
        updater[shortcut] = (path, ...args) => {
            let additionCommand = {['$' + shortcut]: args.length === 1 ? args[0] : args};
            let newCommands = merge(commands, path, additionCommand);
            return createUpdater(value, newCommands);
        };
        return updater;
    },
    {
        value() {
            return update(value, commands);
        },

        withDiff() {
            return withDiff(value, commands);
        }
    }
);

/**
 * 包装一个对象为可链式调用更新的对象
 *
 * 包装后的对象带有所有更新快捷方式，同时使用`value()`可获取更新后的值
 *
 * @param {Object} source 包装的对象
 * @return {Object} 可执行所有用于更新的命令
 */
export default source => createUpdater(source, EMPTY_COMMANDS);
