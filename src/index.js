/**
 * san-update
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file entry module
 * @author otakustay
 */

import update from './update';
import chain from './chain';
import macro from './macro';

export {
    update as update,
    chain as chain,
    chain as immutable
};
export {macro};
export {
    set,
    push, unshift, splice, map, filter, reduce, slice,
    merge, defaults,
    invoke,
    omit,
    composeBefore, composeAfter
} from './update';
