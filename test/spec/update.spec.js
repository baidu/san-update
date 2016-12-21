import {update, set, push, unshift, splice, merge, defaults, invoke, omit} from 'index';

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

describe('update method', () => {
    it('should update a single property value', () => {
        let source = createSourceObject();
        let result = update(source, {alice: {$set: 2}});
        expect(result.alice).toBe(2);
        expect(source).toEqual(createSourceObject());
        result.alice = 1;
        expect(result).toEqual(source);
    });

    it('should include prototype properties', () => {
        let prototype = {x: 1};
        let source = Object.create(prototype);
        source.y = 2;
        let result = update(source, {y: {$set: 3}});
        expect(result).toEqual({x: 1, y: 3});
    })

    it('should update array by index', () => {
        let source = createSourceObject();
        let result = update(source, {foo: {2: {$set: 4}}});
        expect(result.foo[2]).toBe(4);
        expect(source).toEqual(createSourceObject());
        result.foo[2] = 3;
        expect(result).toEqual(source);
    });

    it('should update a nested property value', () => {
        let source = createSourceObject();
        let result = update(source, {tom: {jack: {$set: 2}}});
        expect(result.tom.jack).toBe(2);
        expect(source).toEqual(createSourceObject());
        result.tom.jack = 1;
        expect(result).toEqual(source);
    });

    it('should create nested property if not exist', () => {
        let source = createSourceObject();
        let result = update(source, {a: {b: {$set: 2}}});
        expect(result.a.b).toBe(2);
        expect(source).toEqual(createSourceObject());
        delete result.a;
        expect(result).toEqual(source);
    });

    it('should recognize push command', () => {
        let source = createSourceObject();
        let result = update(source, {x: {y: {z: {$push: 4}}}});
        expect(result.x.y.z).toEqual([1, 2, 3, 4]);
        expect(source).toEqual(createSourceObject());
        result.x.y.z.pop();
        expect(result).toEqual(source);
    });

    it('should recognize unshift command', () => {
        let source = createSourceObject();
        let result = update(source, {x: {y: {z: {$unshift: 0}}}});
        expect(result.x.y.z).toEqual([0, 1, 2, 3]);
        expect(source).toEqual(createSourceObject());
        result.x.y.z.shift();
        expect(result).toEqual(source);
    });

    it('should recognize splice command', () => {
        let source = createSourceObject();
        let result = update(source, {x: {y: {z: {$splice: [1, 1, 6, 7, 8]}}}});
        expect(result.x.y.z).toEqual([1, 6, 7, 8, 3]);
        expect(source).toEqual(createSourceObject());
        result.x.y.z = [1, 2, 3];
        expect(result).toEqual(source);
    });

    it('should recognize merge command', () => {
        let source = createSourceObject();
        let result = update(source, {x: {y: {$merge: {a: 1, b: 2, z: source.x.y.z}}}});
        expect(result.x.y).toEqual({a: 1, b: 2, z: [1, 2, 3]});
        expect(source).toEqual(createSourceObject());
    });

    it('should accept merge command on null objects', () => {
        let source = {x: {a: 1}};
        let extension = {b: 2};
        let result = update(source, {y: {$merge: extension}});
        expect(result).toEqual({x: {a: 1}, y: {b: 2}});
        expect(result.y).not.toBe(extension);
    });

    it('should recognize defaults command', () => {
        let source = createSourceObject();
        let result = update(source, {x: {y: {$defaults: {a: 1, b: 2, z: 3}}}});
        expect(result.x.y).toEqual({a: 1, b: 2, z: [1, 2, 3]});
        expect(source).toEqual(createSourceObject());
    });

    it('should recognize invoke command', () => {
        let source = createSourceObject();
        let result = update(source, {tom: {jack: {$invoke(x) { return x * 2; }}}});
        expect(result.tom.jack).toBe(2);
        expect(source).toEqual(createSourceObject());
    });

    it('should recognize omit command', () => {
        let source = createSourceObject();
        let result = update(source, {tom: {jack: {$omit: true}}});
        expect(result.tom.hasOwnProperty('jack')).toBe(false);
        expect(source).toEqual(createSourceObject());
    });

    it('should accept assert boolean in omit command', () => {
        let source = createSourceObject();
        let result = update(source, {tom: {jack: {$omit: false}}});
        expect(result).toEqual(source);
        expect(source).toEqual(createSourceObject());
    });

    it('should accept assert function in omit command', () => {
        let source = createSourceObject();
        let result = update(
            source,
            {
                tom: {
                    jack: {
                        $omit() {
                            return true;
                        }
                    }
                },
                x: {
                    y: {
                        $omit() {
                            return false;
                        }
                    }
                }
            }
        );
        expect(result.tom.hasOwnProperty('jack')).toBe(false);
        expect(result.x.y).toBe(source.x.y);
        expect(source).toEqual(createSourceObject());
    });

    it('should expose set function', () => {
        let source = createSourceObject();
        let result = set(source, ['tom', 'jack'], 2);
        expect(result.tom.jack).toBe(2);
        expect(source).toEqual(createSourceObject());
        result.tom.jack = 1;
        expect(result).toEqual(source);
    });

    it('should accept string as property path', () => {
        let source = {x: 1};
        let result = set(source, 'x', 2);
        expect(result).toEqual({x: 2});
    });

    it('should accept number as property path (especially 0)', () => {
        let source = [1, 2, 3];
        let result = set(source, 0, 4);
        expect(result).toEqual([4, 2, 3]);
    });

    it('should expose push function', () => {
        let source = createSourceObject();
        let result = push(source, ['x', 'y', 'z'], 4);
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

    it('should expose splice function', () => {
        let source = createSourceObject();
        let result = splice(source, ['x', 'y', 'z'], 1, 1, 6, 7, 8);
        expect(result.x.y.z).toEqual([1, 6, 7, 8, 3]);
        expect(source).toEqual(createSourceObject());
        result.x.y.z = [1, 2, 3];
        expect(result).toEqual(source);
    });

    it('should expose merge function', () => {
        let source = createSourceObject();
        let result = merge(source, ['x', 'y'], {a: 1, b: 2, z: 3});
        expect(result.x.y).toEqual({a: 1, b: 2, z: 3});
        expect(source).toEqual(createSourceObject());
    });

    it('should expose defaults function', () => {
        let source = createSourceObject();
        let result = defaults(source, ['x', 'y'], {a: 1, b: 2, z: 3});
        expect(result.x.y).toEqual({a: 1, b: 2, z: [1, 2, 3]});
        expect(source).toEqual(createSourceObject());
    });

    it('should expose invoke function', () => {
        let source = createSourceObject();
        let result = invoke(source, ['tom', 'jack'], x => x * 2);
        expect(result.tom.jack).toBe(2);
        expect(source).toEqual(createSourceObject());
    });

    it('should expose omit function', () => {
        let source = createSourceObject();
        let result = omit(source, ['tom', 'jack'], () => true);
        expect(result.tom.hasOwnProperty('jack')).toBe(false);
        expect(source).toEqual(createSourceObject());
    });

    describe('run with first level command', () => {
        it('should work with $set', () => {
            let source = {};
            let result = update(source, {$set: 1});
            expect(result).toBe(1);
            expect(source).toEqual({});
        });

        it('should work with $push', () => {
            let source = [1, 2, 3];
            let result = update(source, {$push: 4});
            expect(result).toEqual([1, 2, 3, 4]);
            expect(source).toEqual([1, 2, 3]);
        });

        it('should work with $unshift', () => {
            let source = [1, 2, 3];
            let result = update(source, {$unshift: 0});
            expect(result).toEqual([0, 1, 2, 3]);
            expect(source).toEqual([1, 2, 3]);
        });

        it('should work with $merge', () => {
            let source = {foo: 1};
            let result = update(source, {$merge: {foo: 3, bar: 2}});
            expect(result).toEqual({foo: 3, bar: 2});
            expect(source).toEqual({foo: 1});
        });

        it('should work with $defaults', () => {
            let source = {foo: 1};
            let result = update(source, {$defaults: {foo: 2, bar: 2}});
            expect(result).toEqual({foo: 1, bar: 2});
            expect(source).toEqual({foo: 1});
        });

        it('should work with $invoke', () => {
            let source = 1;
            let result = update(source, {$invoke(x) { return x * 2; }});
            expect(result).toEqual(2);
            expect(source).toEqual(1);
        });
    });

    describe('shortcut function with first level command', () => {
        it('should work with $set', () => {
            let source = {};
            let result = set(source, null, 1);
            expect(result).toBe(1);
            expect(source).toEqual({});
        });

        it('should work with $push', () => {
            let source = [1, 2, 3];
            let result = push(source, null, 4);
            expect(result).toEqual([1, 2, 3, 4]);
            expect(source).toEqual([1, 2, 3]);
        });

        it('should work with $unshift', () => {
            let source = [1, 2, 3];
            let result = unshift(source, null, 0);
            expect(result).toEqual([0, 1, 2, 3]);
            expect(source).toEqual([1, 2, 3]);
        });

        it('should work with $merge', () => {
            let source = {foo: 1};
            let result = merge(source, null, {bar: 2});
            expect(result).toEqual({foo: 1, bar: 2});
            expect(source).toEqual({foo: 1});
        });

        it('should work with $defaults', () => {
            let source = {foo: 1};
            let result = defaults(source, null, {foo: 2, bar: 2});
            expect(result).toEqual({foo: 1, bar: 2});
            expect(source).toEqual({foo: 1});
        });

        it('should work with $invoke', () => {
            let source = 1;
            let result = invoke(source, null, x => x * 2);
            expect(result).toEqual(2);
            expect(source).toEqual(1);
        });
    });
});
