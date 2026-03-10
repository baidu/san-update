/**
 * san-update
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file TypeScript type definitions for functional programming module
 */

import { PropPath } from './index';

/**
 * FP style update function - curried version of set
 * @param path The property path
 * @param value The value to set
 * @returns A function that takes a source object and returns the updated object
 */
export function set(path: PropPath, value: any): <T = Object>(source: T) => T;

/**
 * FP style update function - curried version of push
 */
export function push(path: PropPath, value: any): <T = Object>(source: T) => T;

/**
 * FP style update function - curried version of unshift
 */
export function unshift(path: PropPath, value: any): <T = Object>(source: T) => T;

/**
 * FP style update function - curried version of pop
 */
export function pop(
    path: PropPath,
    assert?: boolean | ((array: any[]) => boolean)
): <T = Object>(source: T) => T;

/**
 * FP style update function - curried version of shift
 */
export function shift(
    path: PropPath,
    assert?: boolean | ((array: any[]) => boolean)
): <T = Object>(source: T) => T;

/**
 * FP style update function - curried version of removeAt
 */
export function removeAt(path: PropPath, index: number): <T = Object>(source: T) => T;

/**
 * FP style update function - curried version of remove
 */
export function remove(path: PropPath, value: any): <T = Object>(source: T) => T;

/**
 * FP style update function - curried version of splice
 */
export function splice(
    path: PropPath,
    start: number,
    deleteCount: number,
    ...items: any[]
): <T = Object>(source: T) => T;

/**
 * FP style update function - curried version of map
 */
export function map(
    path: PropPath,
    callback: (item: any, index: number, array: any[]) => any
): <T = Object>(source: T) => T;

/**
 * FP style update function - curried version of filter
 */
export function filter(
    path: PropPath,
    callback: (item: any, index: number, array: any[]) => boolean
): <T = Object>(source: T) => T;

/**
 * FP style update function - curried version of reduce
 */
export function reduce(
    path: PropPath,
    ...args: [
        callback: (acc: any, item: any, index: number, array: any[]) => any
    ] | [
        callback: (acc: any, item: any, index: number, array: any[]) => any,
        initialValue: any
    ]
): <T = Object>(source: T) => T;

/**
 * FP style update function - curried version of merge
 */
export function merge(path: PropPath, value: any): <T = Object>(source: T) => T;

/**
 * FP style update function - curried version of defaults
 */
export function defaults(path: PropPath, value: any): <T = Object>(source: T) => T;

/**
 * FP style update function - curried version of apply
 */
export function apply(path: PropPath, factory: (oldValue: any) => any): <T = Object>(source: T) => T;

/**
 * FP style update function - curried version of omit
 */
export function omit(
    path: PropPath,
    assert?: boolean | ((value: any) => boolean)
): <T = Object>(source: T) => T;

/**
 * FP style update function - curried version of composeBefore
 */
export function composeBefore(
    path: PropPath,
    before: (...args: any[]) => any
): <T = Object>(source: T) => T;

/**
 * FP style update function - curried version of composeAfter
 */
export function composeAfter(
    path: PropPath,
    after: (result: any) => any
): <T = Object>(source: T) => T;

/**
 * FP style update function - curried version of applyWith
 */
export function applyWith(
    path: PropPath,
    selectors: ((source: any) => any) | ((source: any) => any)[],
    factory: (...args: any[]) => any
): <T = Object>(source: T) => T;
