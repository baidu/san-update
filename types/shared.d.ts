/**
 * san-update
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file Shared TypeScript type definitions
 */

/**
 * Represents a property path that can be:
 * - A string (single level)
 * - A number (array index)
 * - An array of strings and numbers (multi-level path, can mix both)
 * - null or undefined (direct source update)
 */
export type PropPath = string | number | (string | number)[] | null | undefined;
