import chain from 'chain';

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
        let updateable = chain({});
        expect(typeof updateable.set).toBe('function');
        expect(typeof updateable.merge).toBe('function');
        expect(typeof updateable.push).toBe('function');
        expect(typeof updateable.unshift).toBe('function');
        expect(typeof updateable.splice).toBe('function');
        expect(typeof updateable.defaults).toBe('function');
        expect(typeof updateable.invoke).toBe('function');
        expect(typeof updateable.omit).toBe('function');
    });

    it('should correctly update object', () => {
        let target = chain(createSourceObject())
            .set(['x', 'y', 'z'], 3)
            .push('foo', 4)
            .merge('tom', {tinna: 2})
            .invoke('bob', i => i + 1)
            .value();
        expect(target).toEqual({
            x: {y: {z: 3}},
            foo: [1, 2, 3, 4],
            alice: 1,
            bob: 3,
            tom: {jack: 1, tinna: 2}
        });
    });

    it('should fork an object for each method invocation', () => {
        let source = createSourceObject();
        let a = chain(source).set('foo', 4);
        a.set('bob', 3);
        expect(a.value().bob).toBe(2);
    });
});
