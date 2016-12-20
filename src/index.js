/**
 * san-update
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file entry module
 * @author otakustay
 */

import update from './update';
import chain from './chain';

export {
    update as update,
    chain as chain,
    chain as immutable
};
export {set, push, unshift, splice, merge, defaults, invoke} from './update';
