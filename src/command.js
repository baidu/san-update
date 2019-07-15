/**
 * san-update
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file all available commands
 * @author otakustay
 */

import {clone, indexOf, diffObject, arrayDiffObject} from './util';

/**
 * @private
 *
 * 当指令返回这个对象的时候，说明要把这个属性移除
 */
export const OMIT_THIS_PROPERTY = {};

/**
 * @private
 */
export const availableCommands = {
    $set(container, propertyName, newValue) {
        const oldValue = container[propertyName];
        if (newValue === oldValue) {
            return [newValue, null];
        }

        return [
            newValue,
            diffObject(container.hasOwnProperty(propertyName) ? 'change' : 'add', oldValue, newValue),
        ];
    },

    $push(container, propertyName, item) {
        const array = container[propertyName];

        if (!Array.isArray(array)) {
            throw new Error('Usage of $push command on non array object is forbidden.');
        }

        const newValue = array.concat([item]);
        return [
            newValue,
            arrayDiffObject(array, newValue, array.length, 0, [item]),
        ];
    },

    $unshift(container, propertyName, item) {
        const array = container[propertyName];

        if (!Array.isArray(array)) {
            throw new Error('Usage of $unshift command on non array object is forbidden.');
        }

        const newValue = [item].concat(array);
        return [
            newValue,
            arrayDiffObject(array, newValue, 0, 0, [item]),
        ];
    },

    $pop(container, propertyName, assert) {
        const array = container[propertyName];

        if (!Array.isArray(array)) {
            throw new Error('Usage of $pop command on non array object is forbidden.');
        }

        if (array.length && (assert === true || (typeof assert === 'function' && assert(array)))) {
            const newValue = array.slice(0, -1);
            return [
                newValue,
                arrayDiffObject(array, newValue, array.length, 1, []),
            ];
        }

        return [array, null];
    },

    $shift(container, propertyName, assert) {
        const array = container[propertyName];

        if (!Array.isArray(array)) {
            throw new Error('Usage of $shift command on non array object is forbidden.');
        }

        if (array.length && (assert === true || (typeof assert === 'function' && assert(array)))) {
            const newValue = array.slice(1);
            return [
                newValue,
                arrayDiffObject(array, newValue, array.length, 1, []),
            ];
        }

        return [array, null];
    },

    $removeAt(container, propertyName, index) {
        const array = container[propertyName];

        if (!Array.isArray(array)) {
            throw new Error('Usage of $removeAt command on non array object is forbidden.');
        }

        if (index >= array.length || index < 0) {
            return [array, null];
        }

        const newValue = array.slice(0, index).concat(array.slice(index + 1));
        return [
            newValue,
            arrayDiffObject(array, newValue, index, 1, []),
        ];
    },

    $remove(container, propertyName, item) {
        const array = container[propertyName];

        if (!Array.isArray(array)) {
            throw new Error('Usage of $removeAt command on non array object is forbidden.');
        }

        const index = indexOf(array, item);

        if (index === -1) {
            return [array, null];
        }

        const newValue = array.slice(0, index).concat(array.slice(index + 1));
        return [
            newValue,
            arrayDiffObject(array, newValue, index, 1, []),
        ];
    },

    $splice(container, propertyName, [start, deleteCount, ...items]) {
        const array = container[propertyName];
        // eslint-disable-next-line no-param-reassign
        start = start < 0 ? array.length + start : start;

        if (!Array.isArray(array)) {
            throw new Error('Usage of $splice command on non array object is forbidden.');
        }

        const newValue = array.slice(0, start).concat(items).concat(array.slice(start + deleteCount));
        return [
            newValue,
            arrayDiffObject(array, newValue, start, deleteCount, items),
        ];
    },

    $map(container, propertyName, callback) {
        const array = container[propertyName];

        if (!Array.isArray(array)) {
            throw new Error('Usage of $map command on non array object is forbidden.');
        }

        const newValue = array.map(callback);
        return [
            newValue,
            diffObject('change', array, newValue),
        ];
    },

    $filter(container, propertyName, callback) {
        const array = container[propertyName];

        if (!Array.isArray(array)) {
            throw new Error('Usage of $filter command on non array object is forbidden.');
        }

        const newValue = array.filter(callback);
        return [
            newValue,
            diffObject('change', array, newValue),
        ];
    },

    $reduce(container, propertyName, args) {
        const array = container[propertyName];

        if (!Array.isArray(array)) {
            throw new Error('Usage of $reduce command on non array object is forbidden.');
        }

        // .reduce(callback) : .reduce(callback, initialValue)
        const newValue = typeof args === 'function' ? array.reduce(args) : array.reduce(...args);
        return [
            newValue,
            diffObject('change', array, newValue),
        ];
    },

    $merge(container, propertyName, extensions) {
        const target = container[propertyName] || {};
        const newValue = clone(target);
        const diff = {};
        for (const key in extensions) {
            if (extensions.hasOwnProperty(key)) {
                const newPropertyValue = extensions[key];
                const oldPropertyValue = target[key];
                if (newPropertyValue !== oldPropertyValue) {
                    newValue[key] = newPropertyValue;
                    const changeType = target.hasOwnProperty(key) ? 'change' : 'add';
                    diff[key] = diffObject(changeType, oldPropertyValue, newPropertyValue);
                }
            }
        }

        return [newValue, diff];
    },

    $defaults(container, propertyName, defaults) {
        const target = container[propertyName];
        const newValue = clone(target);
        const diff = {};
        for (const key in defaults) {
            if (defaults.hasOwnProperty(key) && newValue[key] === undefined) {
                newValue[key] = defaults[key];
                diff[key] = diffObject('add', undefined, defaults[key]);
            }
        }

        return [newValue, diff];
    },

    $apply(container, propertyName, factory) {
        const newValue = factory(container[propertyName]);
        return [
            newValue,
            diffObject(container.hasOwnProperty(propertyName) ? 'change' : 'add', container[propertyName], newValue),
        ];
    },

    $omit(container, propertyName, assert) {
        const value = container[propertyName];

        if (assert === true || (typeof assert === 'function' && assert(value))) {
            return [
                OMIT_THIS_PROPERTY,
                diffObject('remove', value, undefined),
            ];
        }

        return [value, null];
    },

    $composeBefore(container, propertyName, before) {
        const fn = container[propertyName];

        if (typeof fn !== 'function') {
            throw new Error('Usage of $composeBefore command on non function object is forbidden.');
        }

        if (typeof before !== 'function') {
            throw new Error('Passing non function object to $composeBefore command is forbidden');
        }

        const newValue = (...args) => fn(before(...args));
        return [
            newValue,
            diffObject('change', fn, newValue),
        ];
    },

    $composeAfter(container, propertyName, after) {
        const fn = container[propertyName];

        if (typeof fn !== 'function') {
            throw new Error('Usage of $composeAfter command on non function object is forbidden.');
        }

        if (typeof after !== 'function') {
            throw new Error('Passing non function object to $composeAfter command is forbidden');
        }

        const newValue = (...args) => after(fn(...args));
        return [
            newValue,
            diffObject('change', fn, newValue),
        ];
    },
};

/**
 * @private
 */
export const availableCommandKeys = Object.keys(availableCommands);

/**
 * @private
 */
export const availableCommandNames = availableCommandKeys.map(key => key.slice(1));
