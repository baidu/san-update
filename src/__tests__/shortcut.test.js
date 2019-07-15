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
    applyWith
} from '../index';

function createSourceObject() {
    return {
        x: {
            y: {
                z: [1, 2, 3]
            }
        },
        foo: [1, 2, 3],
        alice: 1,
        bob: 2,
        tom: {
            jack: 1
        }
    };
}

describe('shortcut functions', () => {
    it('should expose set function', () => {
        let source = createSourceObject();
        let result = set(source, ['tom', 'jack'], 2);
        expect(result.tom.jack).toBe(2);
        expect(source).toEqual(createSourceObject());
        result.tom.jack = 1;
        expect(result).toEqual(source);
    });

    it('should throw if property path is invalid', () => {
        expect(() => set({}, 'x[3.y', 1)).toThrow();
        expect(() => set({}, 'x["y]', 1)).toThrow();
    });

    it('should accept string as property path', () => {
        let source = {x: [1, 2, 3]};
        let result = set(source, 'x[1]', 4);
        expect(result).toEqual({x: [1, 4, 3]});
    });

    it('should accept number as property path (especially 0)', () => {
        let source = [1, 2, 3];
        let result = set(source, 0, 4);
        expect(result).toEqual([4, 2, 3]);
    });

    it('should expose push function', () => {
        let source = createSourceObject();
        let result = push(source, 'x.y.z', 4);
        expect(result.x.y.z).toEqual([1, 2, 3, 4]);
        expect(source).toEqual(createSourceObject());
        result.x.y.z.pop();
        expect(result).toEqual(source);
    });

    it('should expose unshift function', () => {
        let source = createSourceObject();
        let result = unshift(source, ['x', 'y', 'z'], 0);
        expect(result.x.y.z).toEqual([0, 1, 2, 3]);
        expect(source).toEqual(createSourceObject());
        result.x.y.z.shift();
        expect(result).toEqual(source);
    });

    it('should expose pop function', () => {
        let source = createSourceObject();
        let result = pop(source, ['x', 'y', 'z'], true);
        expect(result.x.y.z).toEqual([1, 2]);
        expect(source).toEqual(createSourceObject());
        result.x.y.z.push(3);
        expect(result).toEqual(source);
    });

    it('should expose shift function', () => {
        let source = createSourceObject();
        let result = shift(source, ['x', 'y', 'z'], true);
        expect(result.x.y.z).toEqual([2, 3]);
        expect(source).toEqual(createSourceObject());
        result.x.y.z.unshift(1);
        expect(result).toEqual(source);
    });

    it('should expose removeAt function', () => {
        let source = createSourceObject();
        let result = removeAt(source, ['x', 'y', 'z'], 1);
        expect(result.x.y.z).toEqual([1, 3]);
        expect(source).toEqual(createSourceObject());
        result.x.y.z.splice(1, 0, 2);
        expect(result).toEqual(source);
    });

    it('should expose remove function', () => {
        let source = createSourceObject();
        let result = remove(source, ['x', 'y', 'z'], 1);
        expect(result.x.y.z).toEqual([2, 3]);
        expect(source).toEqual(createSourceObject());
        result.x.y.z.unshift(1);
        expect(result).toEqual(source);
    });

    it('should expose splice function', () => {
        let source = createSourceObject();
        let result = splice(source, 'x["y"][\'z\']', 1, 1, 6, 7, 8);
        expect(result.x.y.z).toEqual([1, 6, 7, 8, 3]);
        expect(source).toEqual(createSourceObject());
        result.x.y.z = [1, 2, 3];
        expect(result).toEqual(source);
    });

    it('should expose map function', () => {
        let source = {x: [1, 2, 3]};
        let result = map(source, '["x"]', x => x + 1);
        expect(result).toEqual({x: [2, 3, 4]});
    });

    it('should expose filter function', () => {
        let source = {x: [1, 2, 3]};
        let result = filter(source, 'x', x => x > 1);
        expect(result).toEqual({x: [2, 3]});
    });

    it('should expose reduce function', () => {
        let source = {x: [1, 2, 3]};
        let result = reduce(source, 'x', (sum, x) => sum + x);
        expect(result).toEqual({x: 6});
        let resultSubstract = reduce(source, 'x', (base, x) => base - x, 10);
        expect(resultSubstract).toEqual({x: 4});
    });

    it('should expose merge function', () => {
        let source = createSourceObject();
        let result = merge(source, 'x["y"]', {a: 1, b: 2, z: 3});
        expect(result.x.y).toEqual({a: 1, b: 2, z: 3});
        expect(source).toEqual(createSourceObject());
    });

    it('should expose defaults function', () => {
        let source = createSourceObject();
        let result = defaults(source, ['x', 'y'], {a: 1, b: 2, z: 3});
        expect(result.x.y).toEqual({a: 1, b: 2, z: [1, 2, 3]});
        expect(source).toEqual(createSourceObject());
    });

    it('should expose apply function', () => {
        let source = createSourceObject();
        let result = apply(source, ['tom', 'jack'], x => x * 2);
        expect(result.tom.jack).toBe(2);
        expect(source).toEqual(createSourceObject());
    });

    it('should expose omit function', () => {
        let source = createSourceObject();
        let result = omit(source, ['tom', 'jack'], () => true);
        expect(result.tom.hasOwnProperty('jack')).toBe(false);
        expect(source).toEqual(createSourceObject());
    });

    it('should assert to true by default on omit function', () => {
        let source = createSourceObject();
        let result = omit(source, ['tom', 'jack']);
        expect(result.tom.hasOwnProperty('jack')).toBe(false);
        expect(source).toEqual(createSourceObject());
    });

    it('should expose applyWith function', () => {
        let source = createSourceObject();
        let result = applyWith(
            source,
            'bob',
            o => o.x.y.z,
            (z, bob) => z.reduce((sum, i) => sum + i) * bob
        );
        expect(result.bob).toBe(12);
        expect(source).toEqual(createSourceObject());
    });

    it('should accept multiple selectors for applyWith function', () => {
        let source = createSourceObject();
        let result = applyWith(
            source,
            'bob',
            [o => o.x.y.z, o => o.foo],
            (z, foo, bob) => z.reduce((sum, i) => sum + i) * foo.length + bob
        );
        expect(result.bob).toBe(20);
        expect(source).toEqual(createSourceObject());
    });

    describe('run with first level command', () => {
        it('should work with set', () => {
            let source = {};
            let result = set(source, null, 1);
            expect(result).toBe(1);
            expect(source).toEqual({});
        });

        it('should work with push', () => {
            let source = [1, 2, 3];
            let result = push(source, null, 4);
            expect(result).toEqual([1, 2, 3, 4]);
            expect(source).toEqual([1, 2, 3]);
        });

        it('should work with unshift', () => {
            let source = [1, 2, 3];
            let result = unshift(source, null, 0);
            expect(result).toEqual([0, 1, 2, 3]);
            expect(source).toEqual([1, 2, 3]);
        });

        it('should work with pop', () => {
            let source = [1, 2, 3];
            let result = pop(source, null, true);
            expect(result).toEqual([1, 2]);
            expect(source).toEqual([1, 2, 3]);
        });

        it('should work with shift', () => {
            let source = [1, 2, 3];
            let result = shift(source, null, array => array.length > 2);
            expect(result).toEqual([2, 3]);
            expect(source).toEqual([1, 2, 3]);
        });

        it('should work with removeAt', () => {
            let source = [1, 2, 3];
            let result = removeAt(source, null, 1);
            expect(result).toEqual([1, 3]);
            expect(source).toEqual([1, 2, 3]);
        });

        it('should work with remove', () => {
            let source = [1, 2, 3];
            let result = remove(source, null, 2);
            expect(result).toEqual([1, 3]);
            expect(source).toEqual([1, 2, 3]);
        });

        it('should work with merge', () => {
            let source = {foo: 1};
            let result = merge(source, null, {bar: 2});
            expect(result).toEqual({foo: 1, bar: 2});
            expect(source).toEqual({foo: 1});
        });

        it('should work with defaults', () => {
            let source = {foo: 1};
            let result = defaults(source, null, {foo: 2, bar: 2});
            expect(result).toEqual({foo: 1, bar: 2});
            expect(source).toEqual({foo: 1});
        });

        it('should work with apply', () => {
            let source = 1;
            let result = apply(source, null, x => x * 2);
            expect(result).toBe(2);
            expect(source).toBe(1);
        });

        it('should work with composeBefore', () => {
            let cache = []
            let raw = value => cache.push(value);
            let before = value => {
                cache.push(value);
                return value + 1;
            };
            let result = composeBefore(raw, null, before);
            result(1);
            expect(cache).toEqual([1, 2]);
        });

        it('should work with composeAfter', () => {
            let cache = []
            let raw = value => {
                cache.push(value);
                return value + 1;
            }
            let after = value => cache.push(value);
            let result = composeAfter(raw, null, after);
            result(1);
            expect(cache).toEqual([1, 2]);
        });
    });
});
