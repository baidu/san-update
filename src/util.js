/**
 * san-update
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file utility module
 * @author otakustay
 */

export let clone = target => {
    let result = {};
    /* eslint-disable guard-for-in */
    for (let key in target) {
        result[key] = target[key];
    }
    /* eslint-enable guard-for-in */

    return result;
};

export let find = (array, fn) => {
    for (let i = 0; i < array.length; i++) {
        let item = array[i];
        if (fn(item)) {
            return item;
        }
    }

    return undefined;
};

export let notEmpty = o => {
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

export let indexOf = (array, o) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === o) {
            return i;
        }
    }

    return -1;
};

export let diffObject = (type, oldValue, newValue) => {
    return {
        $change: type,
        oldValue: oldValue,
        newValue: newValue
    };
};

export let arrayDiffObject = (oldValue, newValue, spliceIndex, deleteCount, insertions) => {
    return {
        $change: 'change',
        oldValue: oldValue,
        newValue: newValue,
        splice: {
            index: spliceIndex,
            deleteCount: deleteCount,
            insertions: insertions
        }
    };
};
