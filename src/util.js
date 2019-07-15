/**
 * san-update
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file utility module
 * @author otakustay
 */

export const clone = target => {
    const result = {};
    /* eslint-disable guard-for-in */
    for (const key in target) {
        result[key] = target[key];
    }
    /* eslint-enable guard-for-in */

    return result;
};

export const find = (array, fn) => {
    for (let i = 0; i < array.length; i++) {
        const item = array[i];
        if (fn(item)) {
            return item;
        }
    }

    // eslint-disable-next-line consistent-return
    return undefined;
};

export const notEmpty = o => {
    if (!o) {
        return false;
    }

    for (const key in o) {
        if (o.hasOwnProperty(key)) {
            return true;
        }
    }

    return false;
};

export const indexOf = (array, o) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === o) {
            return i;
        }
    }

    return -1;
};

export const diffObject = (type, oldValue, newValue) => {
    return {
        $change: type,
        oldValue: oldValue,
        newValue: newValue,
    };
};

export const arrayDiffObject = (oldValue, newValue, spliceIndex, deleteCount, insertions) => {
    return {
        $change: 'change',
        oldValue: oldValue,
        newValue: newValue,
        splice: {
            index: spliceIndex,
            deleteCount: deleteCount,
            insertions: insertions,
        },
    };
};
