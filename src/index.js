/**
 * san-update
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file entry module
 * @author otakustay
 */

import chain from './chain';
import macro from './macro';

export {update, withDiff} from './update';
export {
    chain as chain,
    chain as immutable
};
export {macro};
export {
    set,
    push, unshift, splice, map, filter, reduce,
    merge, defaults,
    apply,
    omit,
    composeBefore, composeAfter
} from './shortcut';
