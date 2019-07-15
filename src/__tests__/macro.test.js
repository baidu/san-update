import {macro, builder, updateBuilder} from '../index';

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

describe('macro method', () => {
    it('should export alias', () => {
        expect(macro === builder).toBe(true);
        expect(macro === updateBuilder).toBe(true);
    });

    it('should export all update shortcuts', () => {
        let builder = macro();
        expect(typeof builder.set).toBe('function');
        expect(typeof builder.merge).toBe('function');
        expect(typeof builder.push).toBe('function');
        expect(typeof builder.unshift).toBe('function');
        expect(typeof builder.pop).toBe('function');
        expect(typeof builder.shift).toBe('function');
        expect(typeof builder.removeAt).toBe('function');
        expect(typeof builder.remove).toBe('function');
        expect(typeof builder.splice).toBe('function');
        expect(typeof builder.map).toBe('function');
        expect(typeof builder.filter).toBe('function');
        expect(typeof builder.reduce).toBe('function');
        expect(typeof builder.defaults).toBe('function');
        expect(typeof builder.apply).toBe('function');
        expect(typeof builder.omit).toBe('function');
        expect(typeof builder.composeBefore).toBe('function');
        expect(typeof builder.composeAfter).toBe('function');
    });

    it('should correctly build an update function', () => {
        let update = macro()
            .set(['x', 'y', 'z'], 3)
            .splice('foo', 1, 2, 4, 5)
            .merge('tom', {tinna: 2})
            .apply('bob', i => i + 1)
            .build();
        let target = update(createSourceObject());
        let base = {
            x: {y: {z: 3}},
            foo: [1, 4, 5],
            alice: 1,
            bob: 3,
            tom: {jack: 1, tinna: 2}
        };
        expect(target).toEqual(base);
    });

    it('should export a withDiff function attached on the update function', () => {
        let update = macro()
            .apply('x', i => i + 1)
            .build();
        let [target, diff] = update.withDiff({x: 2});
        expect(target).toEqual({x: 3});
        expect(diff).toEqual({x: {$change: 'change', oldValue: 2, newValue: 3}});
    });

    it('should correctly build a withDiff function', () => {
        let withDiff = macro()
            .apply('x', i => i + 1)
            .buildWithDiff();
        let [target, diff] = withDiff({x: 2});
        expect(target).toEqual({x: 3});
        expect(diff).toEqual({x: {$change: 'change', oldValue: 2, newValue: 3}});
    });

    it('should fork an object for each method invocation', () => {
        let updateFoo = macro().set('foo', 1);
        let updateFooAndBob = updateFoo.set('bob', 3);
        let source = createSourceObject();
        let target = updateFoo.build()(source);
        expect(target.bob).toBe(2);
    });
});
