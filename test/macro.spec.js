import {expect} from 'chai';
import deepEqual from 'deep-eql';
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
        expect(typeof builder.splice).to.equal('function');
        expect(typeof builder.defaults).to.equal('function');
        expect(typeof builder.invoke).to.equal('function');
        expect(typeof builder.omit).to.equal('function');
    });

    it('should correctly build an update function', () => {
        let update = macro()
            .set(['x', 'y', 'z'], 3)
            .splice('foo', 1, 2, 4, 5)
            .merge('tom', {tinna: 2})
            .invoke('bob', i => i + 1)
            .build();
        let target = update(createSourceObject());
        let isEqual = deepEqual(
            target,
            {
                x: {y: {z: 3}},
                foo: [1, 4, 5],
                alice: 1,
                bob: 3,
                tom: {jack: 1, tinna: 2}
            }
        );
        expect(isEqual).to.equal(true);
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
        let isEqual = deepEqual(
            target,
            {
                x: {y: {z: 3}},
                foo: [1, 2, 3, 4],
                alice: 1,
                bob: 3,
                tom: {jack: 1, tinna: 2}
            }
        );
        expect(isEqual).to.equal(true);
    });
});
