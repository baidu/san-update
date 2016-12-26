import {expect} from 'chai';
import deepEqual from 'deep-eql';
import {immutable} from '../src/index';

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
    it('should export all update shortcuts', () => {
        let updateable = immutable({});
        expect(typeof updateable.set).to.equal('function');
        expect(typeof updateable.merge).to.equal('function');
        expect(typeof updateable.push).to.equal('function');
        expect(typeof updateable.unshift).to.equal('function');
        expect(typeof updateable.splice).to.equal('function');
        expect(typeof updateable.defaults).to.equal('function');
        expect(typeof updateable.invoke).to.equal('function');
        expect(typeof updateable.omit).to.equal('function');
    });

    it('should correctly update object', () => {
        let target = immutable(createSourceObject())
            .set(['x', 'y', 'z'], 3)
            .push('foo', 4)
            .merge('tom', {tinna: 2})
            .invoke('bob', i => i + 1)
            .value();
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

    it('should fork an object for each method invocation', () => {
        let source = createSourceObject();
        let a = immutable(source).set('foo', 4);
        a.set('bob', 3);
        expect(a.value().bob).to.equal(2);
    });
});
