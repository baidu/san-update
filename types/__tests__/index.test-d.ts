/**
 * san-update
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file Type tests for main module
 */

import { expectType, expectError } from 'tsd';
import {
    update,
    withDiff,
    chain,
    macro,
    builder,
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
    // Types
    PropPath,
    Command,
    Commands,
    Chain,
    Builder,
    DiffObject,
    SetCommand,
    PushCommand,
    MergeCommand,
    ApplyCommand,
} from '../index';

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
// Test Command types
// ============================================

const setCmd: SetCommand<string> = { $set: 'value' };
const pushCmd: PushCommand<string> = { $push: 'item' };
const mergeCmd: MergeCommand<Partial<TestState>> = { $merge: { name: 'new' } };
const applyCmd: ApplyCommand<number> = { $apply: (x: number) => x + 1 };

// ============================================
// Test update function
// ============================================

// Basic update with $set
const updated = update(state, { name: { $set: 'new name' } });
expectType<TestState>(updated);

// Update with nested path
const nestedUpdate = update(state, {
    nested: {
        value: { $set: 10 },
    },
});
expectType<TestState>(nestedUpdate);

// Update with array operations
const arrayUpdate = update(state, {
    items: { $push: 'c' },
});
expectType<TestState>(arrayUpdate);

// Update with $merge
const mergedUpdate = update(state, {
    $merge: { name: 'merged', age: 30 },
});
expectType<TestState>(mergedUpdate);

// Update with $apply
const appliedUpdate = update(state, {
    age: { $apply: (x) => x + 1 },
});
expectType<TestState>(appliedUpdate);

// ============================================
// Test withDiff function
// ============================================

const [updatedState, diff] = withDiff(state, { name: { $set: 'new' } });
expectType<TestState>(updatedState);
expectType<DiffObject>(diff);

// ============================================
// Test chain API
// ============================================

const chainResult = chain(state)
    .set('name', 'new name')
    .set(['nested', 'value'], 10)
    .push('items', 'c')
    .value();
expectType<TestState>(chainResult);

// Chain with array operations
const chainArrayResult = chain(state)
    .pop('items')
    .shift('items')
    .unshift('items', 'x')
    .removeAt('items', 0)
    .remove('items', 'a')
    .splice('items', 0, 1, 'new')
    .value();
expectType<TestState>(chainArrayResult);

// Chain with map/filter/reduce
const chainTransformResult = chain(state)
    .map('items', (item) => item.toUpperCase())
    .filter('items', (item) => item.length > 0)
    .reduce('items', (acc, item) => acc + item, '')
    .value();
expectType<TestState>(chainTransformResult);

// Chain with merge/defaults/apply
const chainMergeResult = chain(state)
    .merge('nested', { value: 5 })
    .defaults('nested', { value: 0 })
    .apply('age', (x) => x + 1)
    .value();
expectType<TestState>(chainMergeResult);

// Chain with omit
const chainOmitResult = chain(state)
    .omit('name')
    .value();
expectType<TestState>(chainOmitResult);

// Chain with composeBefore/composeAfter
const fn = (x: number) => x * 2;
const chainComposeResult = chain({ fn })
    .composeBefore('fn', (x: number) => x + 1)
    .composeAfter('fn', (x: number) => x + 1)
    .value();
expectType<{ fn: (x: number) => number }>(chainComposeResult);

// Chain withDiff
const [chainValue, chainDiff] = chain(state)
    .set('name', 'new')
    .withDiff();
expectType<TestState>(chainValue);
expectType<DiffObject>(chainDiff);

// ============================================
// Test macro API
// ============================================

const updateBuilder = macro()
    .set('name', 'new name')
    .push('items', 'c')
    .build();

const macroResult = updateBuilder(state);
expectType<TestState>(macroResult);

// Builder with buildWithDiff
const updateBuilderWithDiff = macro()
    .set('name', 'new name')
    .buildWithDiff();

const [macroValue, macroDiff] = updateBuilderWithDiff(state);
expectType<TestState>(macroValue);
expectType<DiffObject>(macroDiff);

// Builder with all operations
const fullBuilder = macro()
    .set('name', 'test')
    .push('items', 'a')
    .unshift('items', 'b')
    .pop('items')
    .shift('items')
    .removeAt('items', 0)
    .remove('items', 'x')
    .splice('items', 0, 1, 'new')
    .map('items', (x) => x)
    .filter('items', () => true)
    .reduce('items', (acc, x) => acc + x)
    .merge('nested', { value: 1 })
    .defaults('nested', { value: 0 })
    .apply('age', (x) => x)
    .omit('name')
    .composeBefore('age', (x: number) => x)
    .composeAfter('age', (x: number) => x)
    .build();
const fullBuilderResult = fullBuilder(state);
expectType<TestState>(fullBuilderResult);

// ============================================
// Test builder API (alias for macro)
// ============================================

const updateBuilderFn = builder()
    .set('name', 'new name')
    .push('items', 'c')
    .build();

const builderResult = updateBuilderFn(state);
expectType<TestState>(builderResult);

// Builder with buildWithDiff
const updateBuilderFnWithDiff = builder()
    .set('name', 'new name')
    .buildWithDiff();

const [builderValue, builderDiff] = updateBuilderFnWithDiff(state);
expectType<TestState>(builderValue);
expectType<DiffObject>(builderDiff);

// Builder with all operations
const fullBuilderFn = builder()
    .set('name', 'test')
    .push('items', 'a')
    .unshift('items', 'b')
    .pop('items')
    .shift('items')
    .removeAt('items', 0)
    .remove('items', 'x')
    .splice('items', 0, 1, 'new')
    .map('items', (x) => x)
    .filter('items', () => true)
    .reduce('items', (acc, x) => acc + x)
    .merge('nested', { value: 1 })
    .defaults('nested', { value: 0 })
    .apply('age', (x) => x)
    .omit('name')
    .composeBefore('age', (x: number) => x)
    .composeAfter('age', (x: number) => x)
    .build();
const fullBuilderFnResult = fullBuilderFn(state);
expectType<TestState>(fullBuilderFnResult);

// ============================================
// Test shortcut functions
// ============================================

// set
const setResult = set(state, 'name', 'new name');
expectType<TestState>(setResult);

const setNestedResult = set(state, ['nested', 'value'], 10);
expectType<TestState>(setNestedResult);

// push
const pushResult = push(state, 'items', 'c');
expectType<TestState>(pushResult);

// unshift
const unshiftResult = unshift(state, 'items', 'c');
expectType<TestState>(unshiftResult);

// pop
const popResult = pop(state, 'items');
expectType<TestState>(popResult);

const popWithAssert = pop(state, 'items', true);
expectType<TestState>(popWithAssert);

const popWithFn = pop(state, 'items', (arr) => arr.length > 0);
expectType<TestState>(popWithFn);

// shift
const shiftResult = shift(state, 'items');
expectType<TestState>(shiftResult);

// removeAt
const removeAtResult = removeAt(state, 'items', 0);
expectType<TestState>(removeAtResult);

// remove
const removeResult = remove(state, 'items', 'a');
expectType<TestState>(removeResult);

// splice
const spliceResult = splice(state, 'items', 0, 1, 'x', 'y');
expectType<TestState>(spliceResult);

// map
const mapResult = map(state, 'items', (item, index, arr) => item.toUpperCase());
expectType<TestState>(mapResult);

// filter
const filterResult = filter(state, 'items', (item, index, arr) => item.length > 0);
expectType<TestState>(filterResult);

// reduce
const reduceResult = reduce(state, 'items', (acc, item, index, arr) => acc + item);
expectType<TestState>(reduceResult);

const reduceWithInitial = reduce(state, 'items', (acc, item) => acc + item, '');
expectType<TestState>(reduceWithInitial);

// merge
const mergeResult = merge(state, 'nested', { value: 5 });
expectType<TestState>(mergeResult);

// defaults
const defaultsResult = defaults(state, 'nested', { value: 0 });
expectType<TestState>(defaultsResult);

// apply
const applyResult = apply(state, 'age', (oldValue) => oldValue + 1);
expectType<TestState>(applyResult);

// omit
const omitResult = omit(state, 'name');
expectType<TestState>(omitResult);

// composeBefore
const composeBeforeResult = composeBefore({ fn: (x: number) => x }, 'fn', (x: number) => x + 1);
expectType<{ fn: (x: number) => number }>(composeBeforeResult);

// composeAfter
const composeAfterResult = composeAfter({ fn: (x: number) => x }, 'fn', (x: number) => x + 1);
expectType<{ fn: (x: number) => number }>(composeAfterResult);

// applyWith
const applyWithResult = applyWith(
    state,
    'name',
    [(s: TestState) => s.age, (s: TestState) => s.name],
    (age, name) => `${name} is ${age}`
);
expectType<TestState>(applyWithResult);

// ============================================
// Test with direct $set command (replace entire object)
// ============================================

// When using a direct $set command without path, the whole object is replaced
const directUpdate = update({ a: 1 } as { a: number }, { $set: { b: 2 } });
expectType<{ a: number }>(directUpdate);

// ============================================
// Test generic type inference
// ============================================

interface CustomState {
    x: number;
    y: string;
}

const customState: CustomState = { x: 1, y: 'test' };
const customResult = update(customState, { x: { $set: 2 } });
expectType<CustomState>(customResult);

const customChainResult = chain(customState)
    .set('x', 10)
    .value();
expectType<CustomState>(customChainResult);
