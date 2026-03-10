/**
 * san-update
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file TypeScript type definitions
 */

/**
 * Represents a property path that can be:
 * - A string (single level)
 * - A string array (multi-level)
 * - A number (array index)
 * - A number array (multi-dimensional indices)
 * - null or undefined (direct source update)
 */
export type PropPath = string | string[] | number | number[] | null | undefined;

/**
 * Represents a change type in the diff object
 */
export type ChangeType = 'add' | 'remove' | 'change';

/**
 * Represents a diff entry for a single property
 */
export interface DiffEntry {
    $change: ChangeType;
    oldValue?: any;
    newValue?: any;
}

/**
 * Represents a diff entry for array operations
 */
export interface ArrayDiffEntry extends DiffEntry {
    splice?: {
        index: number;
        deleteCount: number;
        insertions: any[];
    };
}

/**
 * Recursive diff object structure
 */
export type DiffObject = {
    [key: string | number]: DiffEntry | ArrayDiffEntry | DiffObject;
};

// Command types
export interface SetCommand<T> {
    $set: T;
}

export interface PushCommand<T> {
    $push: T;
}

export interface UnshiftCommand<T> {
    $unshift: T;
}

export interface PopCommand {
    $pop?: boolean | ((array: any[]) => boolean);
}

export interface ShiftCommand {
    $shift?: boolean | ((array: any[]) => boolean);
}

export interface RemoveAtCommand {
    $removeAt: number;
}

export interface RemoveCommand<T> {
    $remove: T;
}

export interface SpliceCommand {
    $splice: [start: number, deleteCount: number, ...items: any[]];
}

export interface MapCommand<T> {
    $map: (item: any, index: number, array: any[]) => T;
}

export interface FilterCommand {
    $filter: (item: any, index: number, array: any[]) => boolean;
}

export interface ReduceCommand<T> {
    $reduce: ((acc: any, item: any, index: number, array: any[]) => T)
        | [((acc: any, item: any, index: number, array: any[]) => T), any];
}

export interface MergeCommand<T> {
    $merge: Partial<T>;
}

export interface DefaultsCommand<T> {
    $defaults: Partial<T>;
}

export interface ApplyCommand<T> {
    $apply: (oldValue: any) => T;
}

export interface OmitCommand {
    $omit?: boolean | ((value: any) => boolean);
}

export interface ComposeBeforeCommand {
    $composeBefore: (...args: any[]) => any;
}

export interface ComposeAfterCommand {
    $composeAfter: (result: any) => any;
}

/**
 * Union type of all available commands
 */
export type Command =
    | SetCommand<any>
    | PushCommand<any>
    | UnshiftCommand<any>
    | PopCommand
    | ShiftCommand
    | RemoveAtCommand
    | RemoveCommand<any>
    | SpliceCommand
    | MapCommand<any>
    | FilterCommand
    | ReduceCommand<any>
    | MergeCommand<any>
    | DefaultsCommand<any>
    | ApplyCommand<any>
    | OmitCommand
    | ComposeBeforeCommand
    | ComposeAfterCommand;

/**
 * Recursive command structure for nested updates
 */
export type Commands = {
    [key: string | number]: Command | Commands;
};

/**
 * Core update function - immutably updates an object
 * @param source The source object to update
 * @param commands The update commands
 * @returns The updated object
 */
export function update<T = any>(source: T, commands: Commands | Command): T;

/**
 * Update function that returns both the result and the diff
 * @param source The source object to update
 * @param commands The update commands
 * @returns A tuple containing [updatedObject, diffObject]
 */
export function withDiff<T = any>(
    source: T,
    commands: Commands | Command
): [T, DiffObject];

/**
 * Chain API interface - enables fluent method chaining for updates
 */
export interface Chain<T> {
    /**
     * Set a value at the specified path
     */
    set(path: PropPath, value: any): Chain<T>;

    /**
     * Push an item to an array at the specified path
     */
    push(path: PropPath, item: any): Chain<T>;

    /**
     * Unshift an item to an array at the specified path
     */
    unshift(path: PropPath, item: any): Chain<T>;

    /**
     * Pop an item from an array at the specified path
     */
    pop(path: PropPath, assert?: boolean | ((array: any[]) => boolean)): Chain<T>;

    /**
     * Shift an item from an array at the specified path
     */
    shift(path: PropPath, assert?: boolean | ((array: any[]) => boolean)): Chain<T>;

    /**
     * Remove an item at a specific index from an array
     */
    removeAt(path: PropPath, index: number): Chain<T>;

    /**
     * Remove a specific value from an array
     */
    remove(path: PropPath, value: any): Chain<T>;

    /**
     * Splice an array at the specified path
     */
    splice(path: PropPath, start: number, deleteCount: number, ...items: any[]): Chain<T>;

    /**
     * Map over an array at the specified path
     */
    map(path: PropPath, callback: (item: any, index: number, array: any[]) => any): Chain<T>;

    /**
     * Filter an array at the specified path
     */
    filter(path: PropPath, callback: (item: any, index: number, array: any[]) => boolean): Chain<T>;

    /**
     * Reduce an array at the specified path
     */
    reduce(
        path: PropPath,
        ...args: [
            callback: (acc: any, item: any, index: number, array: any[]) => any
        ] | [
            callback: (acc: any, item: any, index: number, array: any[]) => any,
            initialValue: any
        ]
    ): Chain<T>;

    /**
     * Merge an object at the specified path
     */
    merge(path: PropPath, value: any): Chain<T>;

    /**
     * Set default values at the specified path
     */
    defaults(path: PropPath, value: any): Chain<T>;

    /**
     * Apply a factory function at the specified path
     */
    apply(path: PropPath, factory: (oldValue: any) => any): Chain<T>;

    /**
     * Omit a property at the specified path
     */
    omit(path: PropPath, assert?: boolean | ((value: any) => boolean)): Chain<T>;

    /**
     * Compose a function before the original function
     */
    composeBefore(path: PropPath, before: (...args: any[]) => any): Chain<T>;

    /**
     * Compose a function after the original function
     */
    composeAfter(path: PropPath, after: (result: any) => any): Chain<T>;

    /**
     * Get the updated value
     */
    value(): T;

    /**
     * Get both the updated value and the diff
     */
    withDiff(): [T, DiffObject];
}

/**
 * Create a chainable updater
 * @param source The source object to wrap
 * @returns A chainable updater
 */
export function chain<T = any>(source: T): Chain<T>;

/**
 * Alias for chain
 */
export { chain as immutable };

/**
 * Builder interface - builds reusable update functions
 */
export interface Builder {
    /**
     * Set a value at the specified path
     */
    set(path: PropPath, value: any): Builder;

    /**
     * Push an item to an array at the specified path
     */
    push(path: PropPath, item: any): Builder;

    /**
     * Unshift an item to an array at the specified path
     */
    unshift(path: PropPath, item: any): Builder;

    /**
     * Pop an item from an array at the specified path
     */
    pop(path: PropPath, assert?: boolean | ((array: any[]) => boolean)): Builder;

    /**
     * Shift an item from an array at the specified path
     */
    shift(path: PropPath, assert?: boolean | ((array: any[]) => boolean)): Builder;

    /**
     * Remove an item at a specific index from an array
     */
    removeAt(path: PropPath, index: number): Builder;

    /**
     * Remove a specific value from an array
     */
    remove(path: PropPath, value: any): Builder;

    /**
     * Splice an array at the specified path
     */
    splice(path: PropPath, start: number, deleteCount: number, ...items: any[]): Builder;

    /**
     * Map over an array at the specified path
     */
    map(path: PropPath, callback: (item: any, index: number, array: any[]) => any): Builder;

    /**
     * Filter an array at the specified path
     */
    filter(path: PropPath, callback: (item: any, index: number, array: any[]) => boolean): Builder;

    /**
     * Reduce an array at the specified path
     */
    reduce(
        path: PropPath,
        ...args: [
            callback: (acc: any, item: any, index: number, array: any[]) => any
        ] | [
            callback: (acc: any, item: any, index: number, array: any[]) => any,
            initialValue: any
        ]
    ): Builder;

    /**
     * Merge an object at the specified path
     */
    merge(path: PropPath, value: any): Builder;

    /**
     * Set default values at the specified path
     */
    defaults(path: PropPath, value: any): Builder;

    /**
     * Apply a factory function at the specified path
     */
    apply(path: PropPath, factory: (oldValue: any) => any): Builder;

    /**
     * Omit a property at the specified path
     */
    omit(path: PropPath, assert?: boolean | ((value: any) => boolean)): Builder;

    /**
     * Compose a function before the original function
     */
    composeBefore(path: PropPath, before: (...args: any[]) => any): Builder;

    /**
     * Compose a function after the original function
     */
    composeAfter(path: PropPath, after: (result: any) => any): Builder;

    /**
     * Build an update function
     * @returns A function that takes a source object and returns the updated object
     */
    build(): <T = any>(source: T) => T;

    /**
     * Build an update function that returns [updatedObject, diffObject]
     * @returns A function that takes a source object and returns [updatedObject, diffObject]
     */
    buildWithDiff(): <T = any>(source: T) => [T, DiffObject];
}

/**
 * Create a macro builder
 * @returns A macro builder
 */
export function macro(): Builder;

/**
 * Aliases for macro
 */
export { macro as builder, macro as updateBuilder };

// Shortcut functions

/**
 * Shortcut function for $set command
 */
export function set<T = Object>(source: T, path: PropPath, value: any): T;

/**
 * Shortcut function for $push command
 */
export function push<T = Object>(source: T, path: PropPath, value: any): T;

/**
 * Shortcut function for $unshift command
 */
export function unshift<T = Object>(source: T, path: PropPath, value: any): T;

/**
 * Shortcut function for $pop command
 */
export function pop<T = Object>(
    source: T,
    path: PropPath,
    assert?: boolean | ((array: any[]) => boolean)
): T;

/**
 * Shortcut function for $shift command
 */
export function shift<T = Object>(
    source: T,
    path: PropPath,
    assert?: boolean | ((array: any[]) => boolean)
): T;

/**
 * Shortcut function for $removeAt command
 */
export function removeAt<T = Object>(source: T, path: PropPath, index: number): T;

/**
 * Shortcut function for $remove command
 */
export function remove<T = Object>(source: T, path: PropPath, value: any): T;

/**
 * Shortcut function for $splice command
 */
export function splice<T = Object>(
    source: T,
    path: PropPath,
    start: number,
    deleteCount: number,
    ...items: any[]
): T;

/**
 * Shortcut function for $map command
 */
export function map<T = Object>(
    source: T,
    path: PropPath,
    callback: (item: any, index: number, array: any[]) => any
): T;

/**
 * Shortcut function for $filter command
 */
export function filter<T = Object>(
    source: T,
    path: PropPath,
    callback: (item: any, index: number, array: any[]) => boolean
): T;

/**
 * Shortcut function for $reduce command
 */
export function reduce<T = Object>(
    source: T,
    path: PropPath,
    ...args: [
        callback: (acc: any, item: any, index: number, array: any[]) => any
    ] | [
        callback: (acc: any, item: any, index: number, array: any[]) => any,
        initialValue: any
    ]
): T;

/**
 * Shortcut function for $merge command
 */
export function merge<T = Object>(source: T, path: PropPath, value: any): T;

/**
 * Shortcut function for $defaults command
 */
export function defaults<T = Object>(source: T, path: PropPath, value: any): T;

/**
 * Shortcut function for $apply command
 */
export function apply<T = Object>(source: T, path: PropPath, factory: (oldValue: any) => any): T;

/**
 * Shortcut function for $omit command
 */
export function omit<T = Object>(
    source: T,
    path: PropPath,
    assert?: boolean | ((value: any) => boolean)
): T;

/**
 * Shortcut function for $composeBefore command
 */
export function composeBefore<T = Object>(
    source: T,
    path: PropPath,
    before: (...args: any[]) => any
): T;

/**
 * Shortcut function for $composeAfter command
 */
export function composeAfter<T = Object>(
    source: T,
    path: PropPath,
    after: (result: any) => any
): T;

/**
 * Shortcut function for applyWith - updates based on dependencies
 */
export function applyWith<T = Object>(
    source: T,
    path: PropPath,
    selectors: ((source: any) => any) | ((source: any) => any)[],
    factory: (...args: any[]) => any
): T;
