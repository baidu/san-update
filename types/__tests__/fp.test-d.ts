/**
 * san-update
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file Type tests for FP (functional programming) module
 */

import { expectType, expectError } from 'tsd';
import {
    set,
    push,
    unshift,
    pop,
    shift,
    removeAt,
    remove,
    splice,
    map,
    filter,
    reduce,
    merge,
    defaults,
    apply,
    omit,
    composeBefore,
    composeAfter,
    applyWith,
} from '../fp';
import { PropPath } from '../index';

// ============================================
// Test Types
// ============================================

interface TestState {
    name: string;
    age: number;
    items: string[];
    nested: {
        value: number;
        deep: {
            foo: string;
        };
    };
    users: Array<{ id: number; name: string }>;
}

const state: TestState = {
    name: 'test',
    age: 25,
    items: ['a', 'b'],
    nested: {
        value: 1,
        deep: {
            foo: 'bar',
        },
    },
    users: [{ id: 1, name: 'John' }],
};

// ============================================
// Test PropPath type - verify values can be assigned to PropPath
// ============================================

const path1: PropPath = 'name';
const path2: PropPath = ['nested', 'value'];
const path3: PropPath = 0;
const path4: PropPath = [0, 1];
const path5: PropPath = null;
const path6: PropPath = undefined;

// ============================================
// Test FP set - curried function
// ============================================

const setName = set('name', 'new name');
const setNameResult = setName(state);
expectType<TestState>(setNameResult);

// Nested path
const setNested = set(['nested', 'value'], 10);
const setNestedResult = setNested(state);
expectType<TestState>(setNestedResult);

// ============================================
// Test FP push - curried function
// ============================================

const pushItem = push('items', 'c');
const pushResult = pushItem(state);
expectType<TestState>(pushResult);

// ============================================
// Test FP unshift - curried function
// ============================================

const unshiftItem = unshift('items', 'c');
const unshiftResult = unshiftItem(state);
expectType<TestState>(unshiftResult);

// ============================================
// Test FP pop - curried function
// ============================================

const popItem = pop('items');
const popResult = popItem(state);
expectType<TestState>(popResult);

// With assertion
const popWithAssert = pop('items', true);
const popWithAssertResult = popWithAssert(state);
expectType<TestState>(popWithAssertResult);

const popWithFn = pop('items', (arr: any[]) => arr.length > 0);
const popWithFnResult = popWithFn(state);
expectType<TestState>(popWithFnResult);

// ============================================
// Test FP shift - curried function
// ============================================

const shiftItem = shift('items');
const shiftResult = shiftItem(state);
expectType<TestState>(shiftResult);

// With assertion
const shiftWithAssert = shift('items', true);
const shiftWithAssertResult = shiftWithAssert(state);
expectType<TestState>(shiftWithAssertResult);

// ============================================
// Test FP removeAt - curried function
// ============================================

const removeAtItem = removeAt('items', 0);
const removeAtResult = removeAtItem(state);
expectType<TestState>(removeAtResult);

// ============================================
// Test FP remove - curried function
// ============================================

const removeItem = remove('items', 'a');
const removeResult = removeItem(state);
expectType<TestState>(removeResult);

// ============================================
// Test FP splice - curried function
// ============================================

const spliceItems = splice('items', 0, 1, 'x', 'y');
const spliceResult = spliceItems(state);
expectType<TestState>(spliceResult);

// ============================================
// Test FP map - curried function
// ============================================

const mapItems = map('items', (item: any, index: number, arr: any[]) => item.toUpperCase());
const mapResult = mapItems(state);
expectType<TestState>(mapResult);

// ============================================
// Test FP filter - curried function
// ============================================

const filterItems = filter('items', (item: any, index: number, arr: any[]) => item.length > 0);
const filterResult = filterItems(state);
expectType<TestState>(filterResult);

// ============================================
// Test FP reduce - curried function
// ============================================

const reduceItems = reduce('items', (acc: any, item: any, index: number, arr: any[]) => acc + item);
const reduceResult = reduceItems(state);
expectType<TestState>(reduceResult);

// With initial value
const reduceWithInitial = reduce('items', (acc: any, item: any) => acc + item, '');
const reduceWithInitialResult = reduceWithInitial(state);
expectType<TestState>(reduceWithInitialResult);

// ============================================
// Test FP merge - curried function
// ============================================

const mergeNested = merge('nested', { value: 5 });
const mergeResult = mergeNested(state);
expectType<TestState>(mergeResult);

// ============================================
// Test FP defaults - curried function
// ============================================

const defaultsNested = defaults('nested', { value: 0 });
const defaultsResult = defaultsNested(state);
expectType<TestState>(defaultsResult);

// ============================================
// Test FP apply - curried function
// ============================================

const applyAge = apply('age', (oldValue: any) => oldValue + 1);
const applyResult = applyAge(state);
expectType<TestState>(applyResult);

// ============================================
// Test FP omit - curried function
// ============================================

const omitName = omit('name');
const omitResult = omitName(state);
expectType<TestState>(omitResult);

// With assertion
const omitWithAssert = omit('name', true);
const omitWithAssertResult = omitWithAssert(state);
expectType<TestState>(omitWithAssertResult);

const omitWithFn = omit('name', (value: any) => value === 'test');
const omitWithFnResult = omitWithFn(state);
expectType<TestState>(omitWithFnResult);

// ============================================
// Test FP composeBefore - curried function
// ============================================

interface FnState {
    fn: (x: number) => number;
}

const fnState: FnState = { fn: (x) => x * 2 };

const composeBeforeFn = composeBefore('fn', (x: number) => x + 1);
const composeBeforeResult = composeBeforeFn(fnState);
expectType<FnState>(composeBeforeResult);

// ============================================
// Test FP composeAfter - curried function
// ============================================

const composeAfterFn = composeAfter('fn', (x: number) => x + 1);
const composeAfterResult = composeAfterFn(fnState);
expectType<FnState>(composeAfterResult);

// ============================================
// Test FP applyWith - curried function
// ============================================

const applyWithName = applyWith(
    'name',
    [(s: TestState) => s.age, (s: TestState) => s.name],
    (age: any, name: any) => `${name} is ${age}`
);
const applyWithResult = applyWithName(state);
expectType<TestState>(applyWithResult);

// Single selector
const applyWithSingle = applyWith(
    'name',
    (s: TestState) => s.age,
    (age: any) => `Age: ${age}`
);
const applyWithSingleResult = applyWithSingle(state);
expectType<TestState>(applyWithSingleResult);

// ============================================
// Test FP composition (pipe-like usage)
// ============================================

const composedUpdate = (s: TestState) =>
    set('name', 'new name')(
        push('items', 'c')(
            apply('age', (x: any) => x + 1)(s)
        )
    );

const composedResult = composedUpdate(state);
expectType<TestState>(composedResult);

// Alternative composition style
const pipe = <T>(...fns: Array<(x: T) => T>) => (x: T): T =>
    fns.reduce((acc, fn) => fn(acc), x);

const pipeline = pipe<TestState>(
    set('name', 'new'),
    push('items', 'c'),
    apply('age', (x: any) => x + 1)
);

const pipelineResult = pipeline(state);
expectType<TestState>(pipelineResult);

// ============================================
// Test generic type inference
// ============================================

interface CustomState {
    x: number;
    y: string;
}

const customState: CustomState = { x: 1, y: 'test' };

const customSet = set('x', 10);
const customResult = customSet(customState);
expectType<CustomState>(customResult);

const customApply = apply('x', (oldValue: any) => oldValue * 2);
const customApplyResult = customApply(customState);
expectType<CustomState>(customApplyResult);

// ============================================
// Test with null/undefined path
// ============================================

const directSet = set(null, { a: 1 });
const directSetResult = directSet({ b: 2 });
// Result should be the new value set (the $set value replaces the whole object)

const directSetUndefined = set(undefined, { a: 1 });
const directSetUndefinedResult = directSetUndefined({ b: 2 });
// Same behavior with undefined path
