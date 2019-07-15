import {immutable, chain} from '../index';

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

describe('chain method', () => {
    it('should export alias', () => {
        expect(immutable === chain).toBe(true);
    });

    it('should export all update shortcuts', () => {
        let updateable = immutable({});
        expect(typeof updateable.set).toBe('function');
        expect(typeof updateable.merge).toBe('function');
        expect(typeof updateable.push).toBe('function');
        expect(typeof updateable.unshift).toBe('function');
        expect(typeof updateable.pop).toBe('function');
        expect(typeof updateable.shift).toBe('function');
        expect(typeof updateable.removeAt).toBe('function');
        expect(typeof updateable.remove).toBe('function');
        expect(typeof updateable.splice).toBe('function');
        expect(typeof updateable.map).toBe('function');
        expect(typeof updateable.filter).toBe('function');
        expect(typeof updateable.reduce).toBe('function');
        expect(typeof updateable.defaults).toBe('function');
        expect(typeof updateable.apply).toBe('function');
        expect(typeof updateable.omit).toBe('function');
        expect(typeof updateable.composeBefore).toBe('function');
        expect(typeof updateable.composeAfter).toBe('function');
    });

    it('should correctly update object', () => {
        let target = immutable(createSourceObject())
            .set(['x', 'y', 'z'], 3)
            .splice('foo', 1, 2, 4, 5)
            .merge('tom', {tinna: 2})
            .apply('bob', i => i + 1)
            .value();
        let base = {
            x: {y: {z: 3}},
            foo: [1, 4, 5],
            alice: 1,
            bob: 3,
            tom: {jack: 1, tinna: 2}
        };
        expect(target).toEqual(base);
    });

    it('should correctly update object with diff', () => {
        let [target, diff] = immutable({x: 2}).apply('x', i => i + 1).withDiff();
        expect(target).toEqual({x: 3});
        expect(diff).toEqual({x: {$change: 'change', oldValue: 2, newValue: 3}});
    })

    it('should fork an object for each method invocation', () => {
        let source = createSourceObject();
        let a = immutable(source).set('foo', 4);
        a.set('bob', 3);
        expect(a.value().bob).toBe(2);
    });
});
