/**
 * san-update
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file macro builder
 * @author otakustay
 */

import {update, withDiff} from './update';
import {availableCommandNames} from './command';
import {merge} from './shortcut';

let createMacro = commands => availableCommandNames.reduce(
    (macro, shortcut) => {
        macro[shortcut] = (path, ...args) => {
            let additionCommand = {['$' + shortcut]: args.length === 1 ? args[0] : args};
            let newCommands = merge(commands, path, additionCommand);
            return createMacro(newCommands);
        };
        return macro;
    },
    {
        build() {
            let result = value => update(value, commands);
            result.withDiff = value => withDiff(value, commands);
            return result;
        },

        buildWithDiff() {
            return value => withDiff(value, commands);
        }
    }
);

const INITIAL_MACRO = createMacro({});

/**
 * 包装一个更新指令为Macro
 *
 * 一个Macro带有所有更新的快捷方式，每一次调用都会生成一个新的Macro，最终使用`build()`可以生成一个包含所有指令的更新对象的函数。
 *
 * @return {Object} 包含所有更新快捷方式的Macro
 */
export default () => INITIAL_MACRO;
