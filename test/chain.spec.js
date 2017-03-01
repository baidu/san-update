import {expect} from 'chai';
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
        expect(typeof updateable.pop).to.equal('function');
        expect(typeof updateable.shift).to.equal('function');
        expect(typeof updateable.removeAt).to.equal('function');
        expect(typeof updateable.remove).to.equal('function');
        expect(typeof updateable.splice).to.equal('function');
        expect(typeof updateable.map).to.equal('function');
        expect(typeof updateable.filter).to.equal('function');
        expect(typeof updateable.reduce).to.equal('function');
        expect(typeof updateable.slice).to.equal('function');
        expect(typeof updateable.defaults).to.equal('function');
        expect(typeof updateable.invoke).to.equal('function');
        expect(typeof updateable.omit).to.equal('function');
        expect(typeof updateable.composeBefore).to.equal('function');
        expect(typeof updateable.composeAfter).to.equal('function');
    });

    it('should correctly update object', () => {
        let target = immutable(createSourceObject())
            .set(['x', 'y', 'z'], 3)
            .splice('foo', 1, 2, 4, 5)
            .merge('tom', {tinna: 2})
            .invoke('bob', i => i + 1)
            .value();
        let base = {
            x: {y: {z: 3}},
            foo: [1, 4, 5],
            alice: 1,
            bob: 3,
            tom: {jack: 1, tinna: 2}
        };
        expect(target).to.deep.equal(base);
    });

    it('should correctly update object with diff', () => {
        let [target, diff] = immutable({x: 2}).invoke('x', i => i + 1).withDiff();
        expect(target).to.deep.equal({x: 3});
        expect(diff).to.deep.equal({x: {$change: 'change', oldValue: 2, newValue: 3}});
    })

    it('should fork an object for each method invocation', () => {
        let source = createSourceObject();
        let a = immutable(source).set('foo', 4);
        a.set('bob', 3);
        expect(a.value().bob).to.equal(2);
    });
});
