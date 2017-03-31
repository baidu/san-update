import {expect} from 'chai';
import {
    set,
    push,
    unshift,
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
} from '../src/index';

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
        expect(result.tom.jack).to.equal(2);
        expect(source).to.deep.equal(createSourceObject());
        result.tom.jack = 1;
        expect(result).to.deep.equal(source);
    });

    it('should throw if property path is invalid', () => {
        expect(() => set({}, 'x[3.y', 1)).to.throw();
        expect(() => set({}, 'x["y]', 1)).to.throw();
    });

    it('should accept string as property path', () => {
        let source = {x: [1, 2, 3]};
        let result = set(source, 'x[1]', 4);
        expect(result).to.deep.equal({x: [1, 4, 3]});
    });

    it('should accept number as property path (especially 0)', () => {
        let source = [1, 2, 3];
        let result = set(source, 0, 4);
        expect(result).to.deep.equal([4, 2, 3]);
    });

    it('should expose push function', () => {
        let source = createSourceObject();
        let result = push(source, 'x.y.z', 4);
        expect(result.x.y.z).to.deep.equal([1, 2, 3, 4]);
        expect(source).to.deep.equal(createSourceObject());
        result.x.y.z.pop();
        expect(result).to.deep.equal(source);
    });

    it('should expose unshift function', () => {
        let source = createSourceObject();
        let result = unshift(source, ['x', 'y', 'z'], 0);
        expect(result.x.y.z).to.deep.equal([0, 1, 2, 3]);
        expect(source).to.deep.equal(createSourceObject());
        result.x.y.z.shift();
        expect(result).to.deep.equal(source);
    });

    it('should expose splice function', () => {
        let source = createSourceObject();
        let result = splice(source, 'x["y"][\'z\']', 1, 1, 6, 7, 8);
        expect(result.x.y.z).to.deep.equal([1, 6, 7, 8, 3]);
        expect(source).to.deep.equal(createSourceObject());
        result.x.y.z = [1, 2, 3];
        expect(result).to.deep.equal(source);
    });

    it('should expose map function', () => {
        let source = {x: [1, 2, 3]};
        let result = map(source, '["x"]', x => x + 1);
        expect(result).to.deep.equal({x: [2, 3, 4]});
    });

    it('should expose filter function', () => {
        let source = {x: [1, 2, 3]};
        let result = filter(source, 'x', x => x > 1);
        expect(result).to.deep.equal({x: [2, 3]});
    });

    it('should expose reduce function', () => {
        let source = {x: [1, 2, 3]};
        let result = reduce(source, 'x', (sum, x) => sum + x);
        expect(result).to.deep.equal({x: 6});
        let resultSubstract = reduce(source, 'x', (base, x) => base - x, 10);
        expect(resultSubstract).to.deep.equal({x: 4});
    });

    it('should expose merge function', () => {
        let source = createSourceObject();
        let result = merge(source, 'x["y"]', {a: 1, b: 2, z: 3});
        expect(result.x.y).to.deep.equal({a: 1, b: 2, z: 3});
        expect(source).to.deep.equal(createSourceObject());
    });

    it('should expose defaults function', () => {
        let source = createSourceObject();
        let result = defaults(source, ['x', 'y'], {a: 1, b: 2, z: 3});
        expect(result.x.y).to.deep.equal({a: 1, b: 2, z: [1, 2, 3]});
        expect(source).to.deep.equal(createSourceObject());
    });

    it('should expose apply function', () => {
        let source = createSourceObject();
        let result = apply(source, ['tom', 'jack'], x => x * 2);
        expect(result.tom.jack).to.equal(2);
        expect(source).to.deep.equal(createSourceObject());
    });

    it('should expose omit function', () => {
        let source = createSourceObject();
        let result = omit(source, ['tom', 'jack'], () => true);
        expect(result.tom.hasOwnProperty('jack')).to.equal(false);
        expect(source).to.deep.equal(createSourceObject());
    });

    it('should assert to true by default on omit function', () => {
        let source = createSourceObject();
        let result = omit(source, ['tom', 'jack']);
        expect(result.tom.hasOwnProperty('jack')).to.equal(false);
        expect(source).to.deep.equal(createSourceObject());
    });

    it('should expose applyWith function', () => {
        let source = createSourceObject();
        let result = applyWith(
            source,
            'bob',
            o => o.x.y.z,
            (z, bob) => z.reduce((sum, i) => sum + i) * bob
        );
        expect(result.bob).to.equal(12);
        expect(source).to.deep.equal(createSourceObject());
    });

    it('should accept multiple selectors for applyWith function', () => {
        let source = createSourceObject();
        let result = applyWith(
            source,
            'bob',
            [o => o.x.y.z, o => o.foo],
            (z, foo, bob) => z.reduce((sum, i) => sum + i) * foo.length + bob
        );
        expect(result.bob).to.equal(20);
        expect(source).to.deep.equal(createSourceObject());
    });

    describe('run with first level command', () => {
        it('should work with $set', () => {
            let source = {};
            let result = set(source, null, 1);
            expect(result).to.equal(1);
            expect(source).to.deep.equal({});
        });

        it('should work with $push', () => {
            let source = [1, 2, 3];
            let result = push(source, null, 4);
            expect(result).to.deep.equal([1, 2, 3, 4]);
            expect(source).to.deep.equal([1, 2, 3]);
        });

        it('should work with $unshift', () => {
            let source = [1, 2, 3];
            let result = unshift(source, null, 0);
            expect(result).to.deep.equal([0, 1, 2, 3]);
            expect(source).to.deep.equal([1, 2, 3]);
        });

        it('should work with $merge', () => {
            let source = {foo: 1};
            let result = merge(source, null, {bar: 2});
            expect(result).to.deep.equal({foo: 1, bar: 2});
            expect(source).to.deep.equal({foo: 1});
        });

        it('should work with $defaults', () => {
            let source = {foo: 1};
            let result = defaults(source, null, {foo: 2, bar: 2});
            expect(result).to.deep.equal({foo: 1, bar: 2});
            expect(source).to.deep.equal({foo: 1});
        });

        it('should work with $apply', () => {
            let source = 1;
            let result = apply(source, null, x => x * 2);
            expect(result).to.equal(2);
            expect(source).to.equal(1);
        });

        it('should work with $composeBefore', () => {
            let cache = []
            let raw = value => cache.push(value);
            let before = value => {
                cache.push(value);
                return value + 1;
            };
            let result = composeBefore(raw, null, before);
            result(1);
            expect(cache).to.deep.equal([1, 2]);
        });

        it('should work with $composeAfter', () => {
            let cache = []
            let raw = value => {
                cache.push(value);
                return value + 1;
            }
            let after = value => cache.push(value);
            let result = composeAfter(raw, null, after);
            result(1);
            expect(cache).to.deep.equal([1, 2]);
        });
    });
});
