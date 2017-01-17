import {expect} from 'chai';
import {
    update,
    set,
    push,
    unshift,
    splice,
    map,
    filter,
    slice,
    reduce,
    merge,
    defaults,
    invoke,
    omit,
    composeBefore,
    composeAfter
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

describe('update method', () => {
    it('should update a single property value', () => {
        let source = createSourceObject();
        let result = update(source, {alice: {$set: 2}});
        expect(result.alice).to.equal(2);
        expect(source).to.deep.equal(createSourceObject());
        result.alice = 1;
        expect(result).to.deep.equal(source);
    });

    it('should include prototype properties', () => {
        let prototype = {x: 1};
        let source = Object.create(prototype);
        source.y = 2;
        let result = update(source, {y: {$set: 3}});
        expect(result).to.deep.equal({x: 1, y: 3});
    })

    it('should update array by index', () => {
        let source = createSourceObject();
        let result = update(source, {foo: {2: {$set: 4}}});
        expect(result.foo[2]).to.equal(4);
        expect(source).to.deep.equal(createSourceObject());
        result.foo[2] = 3;
        expect(result).to.deep.equal(source);
    });

    it('should update a nested property value', () => {
        let source = createSourceObject();
        let result = update(source, {tom: {jack: {$set: 2}}});
        expect(result.tom.jack).to.equal(2);
        expect(source).to.deep.equal(createSourceObject());
        result.tom.jack = 1;
        expect(result).to.deep.equal(source);
    });

    it('should create nested property if not exist', () => {
        let source = createSourceObject();
        let result = update(source, {a: {b: {$set: 2}}});
        expect(result.a.b).to.equal(2);
        expect(source).to.deep.equal(createSourceObject());
        delete result.a;
        expect(result).to.deep.equal(source);
    });

    it('should recognize push command', () => {
        let source = createSourceObject();
        let result = update(source, {x: {y: {z: {$push: 4}}}});
        expect(result.x.y.z).to.deep.equal([1, 2, 3, 4]);
        expect(source).to.deep.equal(createSourceObject());
        result.x.y.z.pop();
        expect(result).to.deep.equal(source);
    });

    it('should throw running push command on none array', () => {
        let source = {x: {}};
        expect(() => update(source, {x: {$push: 1}})).to.throw(Error);
    });

    it('should recognize unshift command', () => {
        let source = createSourceObject();
        let result = update(source, {x: {y: {z: {$unshift: 0}}}});
        expect(result.x.y.z).to.deep.equal([0, 1, 2, 3]);
        expect(source).to.deep.equal(createSourceObject());
        result.x.y.z.shift();
        expect(result).to.deep.equal(source);
    });

    it('should throw running unshift command on none array', () => {
        let source = {x: {}};
        expect(() => update(source, {x: {$unshift: 1}})).to.throw(Error);
    });

    it('should recognize splice command', () => {
        let source = createSourceObject();
        let result = update(source, {x: {y: {z: {$splice: [1, 1, 6, 7, 8]}}}});
        expect(result.x.y.z).to.deep.equal([1, 6, 7, 8, 3]);
        expect(source).to.deep.equal(createSourceObject());
        result.x.y.z = [1, 2, 3];
        expect(result).to.deep.equal(source);
    });

    it('should throw running splice command on none array', () => {
        let source = {x: {}};
        expect(() => update(source, {x: {$splice: [1, 0, 1]}})).to.throw(Error);
    });

    it('should recognize map command', () => {
        let source = {x: [1, 2, 3]};
        let result = update(source, {x: {$map: value => value + 1}});
        expect(result).to.deep.equal({x: [2, 3, 4]});
    });

    it('should throw running map command on none array', () => {
        let source = {x: {}};
        expect(() => update(source, {x: {$map: value => value + 1}})).to.throw(Error);
    });

    it('should recognize filter command', () => {
        let source = {x: [1, 2, 3]};
        let result = update(source, {x: {$filter: value => value > 1}});
        expect(result).to.deep.equal({x: [2, 3]});
    });

    it('should throw running filter command on none array', () => {
        let source = {x: {}};
        expect(() => update(source, {x: {$filter: value => value > 1}})).to.throw(Error);
    });

    it('should recognize reduce command', () => {
        let source = {x: [1, 2, 3]};
        let result = update(source, {x: {$reduce: (sum, value) => sum + value}});
        expect(result).to.deep.equal({x: 6});
        let resultSubstract = update(source, {x: {$reduce: [(base, value) => base - value, 10]}});
        expect(resultSubstract).to.deep.equal({x: 4});
    });

    it('should throw running filter command on none array', () => {
        let source = {x: {}};
        expect(() => update(source, {x: {$reduce: [(sum, value) => sum + value, 0]}})).to.throw(Error);
    });

    it('should recognize slice command', () => {
        let source = {x: [1, 2, 3]};
        let result = update(source, {x: {$slice: [1, -1]}});
        expect(result).to.deep.equal({x: [2]});
    });

    it('should throw running slice command on none array', () => {
        let source = {x: {}};
        expect(() => update(source, {x: {$slice: [1, 1]}})).to.throw(Error);
    });

    it('should recognize merge command', () => {
        let source = createSourceObject();
        let result = update(source, {x: {y: {$merge: {a: 1, b: 2, z: source.x.y.z}}}});
        expect(result.x.y).to.deep.equal({a: 1, b: 2, z: [1, 2, 3]});
        expect(source).to.deep.equal(createSourceObject());
    });

    it('should accept merge command on null objects', () => {
        let source = {x: {a: 1}};
        let extension = {b: 2};
        let result = update(source, {y: {$merge: extension}});
        expect(result).to.deep.equal({x: {a: 1}, y: {b: 2}});
        expect(result.y).not.to.equal(extension);
    });

    it('should ignore prototype properties when merge', () => {
        let source = {x: {a: 1}};
        let prototype = {b: 2};
        let extension = Object.create(prototype);
        let result = update(source, {x: {$merge: extension}});
        expect(result).to.deep.equal(source);
    })

    it('should recognize defaults command', () => {
        let source = createSourceObject();
        let result = update(source, {x: {y: {$defaults: {a: 1, b: 2, z: 3}}}});
        expect(result.x.y).to.deep.equal({a: 1, b: 2, z: [1, 2, 3]});
        expect(source).to.deep.equal(createSourceObject());
    });

    it('should recognize invoke command', () => {
        let source = createSourceObject();
        let result = update(source, {tom: {jack: {$invoke(x) { return x * 2; }}}});
        expect(result.tom.jack).to.equal(2);
        expect(source).to.deep.equal(createSourceObject());
    });

    it('should recognize omit command', () => {
        let source = createSourceObject();
        let result = update(source, {tom: {jack: {$omit: true}}});
        expect(result.tom.hasOwnProperty('jack')).to.equal(false);
        expect(source).to.deep.equal(createSourceObject());
    });

    it('should recognize omit command on array', () => {
        let source = [1, 2, 3];
        let result = update(source, {1: {$omit: true}});
        expect(result).to.deep.equal([1, 3]);
    });

    it('should recognize composeBefore command', () => {
        let cache = [];
        let raw = value => cache.push(value);
        let before = value => {
            cache.push(value);
            return value + 1 ;
        };
        let source = {foo: raw};
        let result = update(source, {foo: {$composeBefore: before}});
        result.foo(1);
        expect(cache).to.deep.equal([1, 2]);
    });

    it('should throw running composeBefore command on none function', () => {
        let source = {foo: {}};
        expect(() => update(source, {foo: {$composeBefore() {}}})).to.throw(Error);
    });

    it('should throw passing non function to composeBefore command', () => {
        let source = {foo() {}};
        expect(() => update(source, {foo: {$composeBefore: {}}})).to.throw(Error);
    });

    it('should recognize composeAfter command', () => {
        let cache = [];
        let raw = value => {
            cache.push(value);
            return value + 1;
        };
        let after = value => cache.push(value);
        let source = {foo: raw};
        let result = update(source, {foo: {$composeAfter: after}});
        result.foo(1);
        expect(cache).to.deep.equal([1, 2]);
    });

    it('should throw running composeAfter command on none function', () => {
        let source = {foo: {}};
        expect(() => update(source, {foo: {$composeAfter() {}}})).to.throw(Error);
    });

    it('should throw passing non function to composeAfter command', () => {
        let source = {foo() {}};
        expect(() => update(source, {foo: {$composeAfter: {}}})).to.throw(Error);
    });

    it('should accept assert boolean in omit command', () => {
        let source = createSourceObject();
        let result = update(source, {tom: {jack: {$omit: false}}});
        expect(result).to.deep.equal(source);
        expect(source).to.deep.equal(createSourceObject());
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
        expect(result.tom.hasOwnProperty('jack')).to.equal(false);
        expect(result.x.y).to.equal(source.x.y);
        expect(source).to.deep.equal(createSourceObject());
    });

    it('should expose set function', () => {
        let source = createSourceObject();
        let result = set(source, ['tom', 'jack'], 2);
        expect(result.tom.jack).to.equal(2);
        expect(source).to.deep.equal(createSourceObject());
        result.tom.jack = 1;
        expect(result).to.deep.equal(source);
    });

    it('should accept string as property path', () => {
        let source = {x: 1};
        let result = set(source, 'x', 2);
        expect(result).to.deep.equal({x: 2});
    });

    it('should accept number as property path (especially 0)', () => {
        let source = [1, 2, 3];
        let result = set(source, 0, 4);
        expect(result).to.deep.equal([4, 2, 3]);
    });

    it('should expose push function', () => {
        let source = createSourceObject();
        let result = push(source, ['x', 'y', 'z'], 4);
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
        let result = splice(source, ['x', 'y', 'z'], 1, 1, 6, 7, 8);
        expect(result.x.y.z).to.deep.equal([1, 6, 7, 8, 3]);
        expect(source).to.deep.equal(createSourceObject());
        result.x.y.z = [1, 2, 3];
        expect(result).to.deep.equal(source);
    });

    it('should expose map function', () => {
        let source = {x: [1, 2, 3]};
        let result = map(source, 'x', x => x + 1);
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

    it('should expose slice function', () => {
        let source = {x: [1, 2, 3]};
        let result = slice(source, 'x', 1, -1);
        expect(result).to.deep.equal({x: [2]});
    });

    it('should expose merge function', () => {
        let source = createSourceObject();
        let result = merge(source, ['x', 'y'], {a: 1, b: 2, z: 3});
        expect(result.x.y).to.deep.equal({a: 1, b: 2, z: 3});
        expect(source).to.deep.equal(createSourceObject());
    });

    it('should expose defaults function', () => {
        let source = createSourceObject();
        let result = defaults(source, ['x', 'y'], {a: 1, b: 2, z: 3});
        expect(result.x.y).to.deep.equal({a: 1, b: 2, z: [1, 2, 3]});
        expect(source).to.deep.equal(createSourceObject());
    });

    it('should expose invoke function', () => {
        let source = createSourceObject();
        let result = invoke(source, ['tom', 'jack'], x => x * 2);
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

    describe('run with first level command', () => {
        it('should work with $set', () => {
            let source = {};
            let result = update(source, {$set: 1});
            expect(result).to.equal(1);
            expect(source).to.deep.equal({});
        });

        it('should work with $push', () => {
            let source = [1, 2, 3];
            let result = update(source, {$push: 4});
            expect(result).to.deep.equal([1, 2, 3, 4]);
            expect(source).to.deep.equal([1, 2, 3]);
        });

        it('should work with $unshift', () => {
            let source = [1, 2, 3];
            let result = update(source, {$unshift: 0});
            expect(result).to.deep.equal([0, 1, 2, 3]);
            expect(source).to.deep.equal([1, 2, 3]);
        });

        it('should work with $map', () => {
            let source = [1, 2, 3];
            let result = update(source, {$map: x => x + 1});
            expect(result).to.deep.equal([2, 3, 4]);
        });

        it('should work with $filter', () => {
            let source = [1, 2, 3];
            let result = update(source, {$filter: x => x > 1});
            expect(result).to.deep.equal([2, 3]);
        });

        it('should work with $reduce', () => {
            let source = [1, 2, 3];
            let result = update(source, {$reduce: (sum, x) => sum + x});
            expect(result).to.equal(6);
        });

        it('should work with $slice', () => {
            let source = [1, 2, 3];
            let result = update(source, {$slice: [1, -1]});
            expect(result).to.deep.equal([2]);
        });

        it('should work with $merge', () => {
            let source = {foo: 1};
            let result = update(source, {$merge: {foo: 3, bar: 2}});
            expect(result).to.deep.equal({foo: 3, bar: 2});
            expect(source).to.deep.equal({foo: 1});
        });

        it('should work with $defaults', () => {
            let source = {foo: 1};
            let result = update(source, {$defaults: {foo: 2, bar: 2}});
            expect(result).to.deep.equal({foo: 1, bar: 2});
            expect(source).to.deep.equal({foo: 1});
        });

        it('should work with $invoke', () => {
            let source = 1;
            let result = update(source, {$invoke(x) { return x * 2; }});
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
            let result = update(raw, {$composeBefore: before});
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
            let result = update(raw, {$composeAfter: after});
            result(1);
            expect(cache).to.deep.equal([1, 2]);
        });
    });

    describe('shortcut function with first level command', () => {
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

        it('should work with $invoke', () => {
            let source = 1;
            let result = invoke(source, null, x => x * 2);
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
