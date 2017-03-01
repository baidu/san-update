import {expect} from 'chai';
import {macro} from '../src/index';

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
    it('should export all update shortcuts', () => {
        let builder = macro();
        expect(typeof builder.set).to.equal('function');
        expect(typeof builder.merge).to.equal('function');
        expect(typeof builder.push).to.equal('function');
        expect(typeof builder.unshift).to.equal('function');
        expect(typeof builder.pop).to.equal('function');
        expect(typeof builder.shift).to.equal('function');
        expect(typeof builder.removeAt).to.equal('function');
        expect(typeof builder.remove).to.equal('function');
        expect(typeof builder.splice).to.equal('function');
        expect(typeof builder.map).to.equal('function');
        expect(typeof builder.filter).to.equal('function');
        expect(typeof builder.reduce).to.equal('function');
        expect(typeof builder.slice).to.equal('function');
        expect(typeof builder.defaults).to.equal('function');
        expect(typeof builder.invoke).to.equal('function');
        expect(typeof builder.omit).to.equal('function');
        expect(typeof builder.composeBefore).to.equal('function');
        expect(typeof builder.composeAfter).to.equal('function');
    });

    it('should correctly build an update function', () => {
        let update = macro()
            .set(['x', 'y', 'z'], 3)
            .splice('foo', 1, 2, 4, 5)
            .merge('tom', {tinna: 2})
            .invoke('bob', i => i + 1)
            .build();
        let target = update(createSourceObject());
        let base = {
            x: {y: {z: 3}},
            foo: [1, 4, 5],
            alice: 1,
            bob: 3,
            tom: {jack: 1, tinna: 2}
        };
        expect(target).to.deep.equal(base);
    });

    it('should correctly build a differ', () => {
        let withDiff = macro()
            .invoke('x', i => i + 1)
            .differ();
        let [target, diff] = withDiff({x: 2});
        expect(target).to.deep.equal({x: 3});
        expect(diff).to.deep.equal({x: {$change: 'change', oldValue: 2, newValue: 3}});
    });

    it('should fork an object for each method invocation', () => {
        let updateFoo = macro().set('foo', 1);
        let updateFooAndBob = updateFoo.set('bob', 3);
        let source = createSourceObject();
        let target = updateFoo.build()(source);
        expect(target.bob).to.equal(2);
    });

    it('should accept an initial command', () => {
        let update = macro({foo: {$push: 4}, tom: {$merge: {tinna: 2}}})
            .set(['x', 'y', 'z'], 3)
            .invoke('bob', i => i + 1)
            .build();
        let target = update(createSourceObject());
        let base = {
            x: {y: {z: 3}},
            foo: [1, 2, 3, 4],
            alice: 1,
            bob: 3,
            tom: {jack: 1, tinna: 2}
        };
        expect(target).to.deep.equal(base);
    });
});