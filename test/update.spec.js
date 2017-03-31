import {expect} from 'chai';
import {
    update,
    withDiff,
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

function diffObject(property, diff) {
    if (!property) {
        return diff;
    }

    if (typeof property === 'string') {
        property = [property];
    }

    let result = {};
    let current = result;
    for (let i = 0; i < property.length; i++) {
        let name = property[i];
        current[name] = i === property.length - 1 ? diff : {};
        current = current[name];
    }

    return result;
}

function diffOfChange(property, oldValue, newValue) {
    return diffObject(property, {$change: 'change', oldValue: oldValue, newValue: newValue});
}

function diffOfAdd(property, value) {
    return diffObject(property, {$change: 'add', oldValue: undefined, newValue: value});
}

function diffOfRemove(property, value) {
    return diffObject(property, {$change: 'remove', oldValue: value, newValue: undefined});
}

function diffOfArray(property, oldValue, newValue, index, deleteCount, insertions) {
    return diffObject(
        property,
        {
            $change: 'change',
            oldValue: oldValue,
            newValue: newValue,
            splice: {index, deleteCount, insertions}
        }
    );
}

describe('update method', () => {
    it('should update a single property value', () => {
        let source = createSourceObject();
        let [result, diff] = withDiff(source, {alice: {$set: 2}});
        expect(result.alice).to.equal(2);
        expect(source).to.deep.equal(createSourceObject());
        result.alice = 1;
        expect(result).to.deep.equal(source);
        expect(diff).to.deep.equal(diffOfChange('alice', 1, 2));
    });

    it('should give addition change when update an unexist property', () => {
        let diff = withDiff({}, {x: {$set: 1}})[1];
        expect(diff).to.deep.equal(diffOfAdd('x', 1));
    });

    it('should not give change when update with the same value', () => {
        // 同时测试对notEmpty的prototype检查
        Object.prototype.missing = 1;
        let diff = withDiff({x: {y: 1}}, {x: {y: {$set: 1}}})[1];
        expect(diff).to.deep.equal({});
        delete Object.prototype.missing;
    });

    it('should not give change when update with the same value on array', () => {
        let diff = withDiff([1, 2, 3], {1: {$set: 2}})[1];
        expect(diff).to.deep.equal({});
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
        let [result, diff] = withDiff(source, {foo: {2: {$set: 4}}});
        expect(result.foo[2]).to.equal(4);
        expect(source).to.deep.equal(createSourceObject());
        result.foo[2] = 3;
        expect(result).to.deep.equal(source);
        expect(diff).to.deep.equal(diffOfChange(['foo', 2], 3, 4));
    });

    it('should update a nested property value', () => {
        let source = createSourceObject();
        let [result, diff] = withDiff(source, {tom: {jack: {$set: 2}}});
        expect(result.tom.jack).to.equal(2);
        expect(source).to.deep.equal(createSourceObject());
        result.tom.jack = 1;
        expect(result).to.deep.equal(source);
        expect(diff).to.deep.equal(diffOfChange(['tom', 'jack'], 1, 2));
    });

    it('should create nested property if not exist', () => {
        let source = createSourceObject();
        let [result, diff] = withDiff(source, {a: {b: {$set: 2}}});
        expect(result.a.b).to.equal(2);
        expect(source).to.deep.equal(createSourceObject());
        delete result.a;
        expect(result).to.deep.equal(source);
        expect(diff).to.deep.equal(diffOfAdd(['a', 'b'], 2));
    });

    it('should recognize push command', () => {
        let source = createSourceObject();
        let [result, diff] = withDiff(source, {x: {y: {z: {$push: 4}}}});
        expect(result.x.y.z).to.deep.equal([1, 2, 3, 4]);
        expect(source).to.deep.equal(createSourceObject());
        result.x.y.z = result.x.y.z.slice(0, -1);
        expect(result).to.deep.equal(source);
        expect(diff).to.deep.equal(diffOfArray(['x', 'y', 'z'], [1, 2, 3], [1, 2, 3, 4], 3, 0, [4]));
    });

    it('should throw running push command on none array', () => {
        let source = {x: {}};
        expect(() => withDiff(source, {x: {$push: 1}})).to.throw(Error);
    });

    it('should recognize unshift command', () => {
        let source = createSourceObject();
        let [result, diff] = withDiff(source, {x: {y: {z: {$unshift: 0}}}});
        expect(result.x.y.z).to.deep.equal([0, 1, 2, 3]);
        expect(source).to.deep.equal(createSourceObject());
        result.x.y.z = result.x.y.z.slice(1);
        expect(result).to.deep.equal(source);
        expect(diff).to.deep.equal(diffOfArray(['x', 'y', 'z'], [1, 2, 3], [0, 1, 2, 3], 0, 0, [0]));
    });

    it('should throw running unshift command on none array', () => {
        let source = {x: {}};
        expect(() => update(source, {x: {$unshift: 1}})).to.throw(Error);
    });

    it('should recognize pop command', () => {
        let source = createSourceObject();
        let [result, diff] = withDiff(source, {foo: {$pop: true}});
        expect(result.foo).to.deep.equal([1, 2]);
        expect(source).to.deep.equal(createSourceObject());
        result.foo = [1, 2, 3];
        expect(result).to.deep.equal(source);
        expect(diff).to.deep.equal(diffOfArray('foo', [1, 2, 3], [1, 2], 3, 1, []));
    });

    it('should accept assertion boolean value on pop command', () => {
        let [result, diff] = withDiff({x: [1, 2, 3]}, {x: {$pop: false}});
        expect(result).to.deep.equal({x: [1, 2, 3]});
        expect(diff).to.deep.equal({});
    });

    it('should accept assertion function on pop command', () => {
        let [result, diff] = withDiff({x: [1, 2, 3]}, {x: {$pop: () => false}});
        expect(result).to.deep.equal({x: [1, 2, 3]});
        expect(diff).to.deep.equal({});
    });

    it('should throw running pop command on none array', () => {
        let source = {x: {}};
        expect(() => update(source, {x: {$pop: false}})).to.throw(Error);
    });

    it('should keep array unmodified when running pop command on empty array', () => {
        let [result, diff] = withDiff({x: []}, {x: {$pop: true}});
        expect(result).to.deep.equal({x: []});
        expect(diff).to.deep.equal({});
    });

    it('should recognize shift command', () => {
        let source = createSourceObject();
        let [result, diff] = withDiff(source, {foo: {$shift: true}});
        expect(result.foo).to.deep.equal([2, 3]);
        expect(source).to.deep.equal(createSourceObject());
        result.foo = [1, 2, 3];
        expect(result).to.deep.equal(source);
        expect(diff).to.deep.equal(diffOfArray('foo', [1, 2, 3], [2, 3], 3, 1, []));
    });

    it('should accept assertion boolean value on shift command', () => {
        let [result, diff] = withDiff({x: [1, 2, 3]}, {x: {$shift: false}});
        expect(result).to.deep.equal({x: [1, 2, 3]});
        expect(diff).to.deep.equal({});
    });

    it('should accept assertion function on shift command', () => {
        let [result, diff] = withDiff({x: [1, 2, 3]}, {x: {$shift: () => false}});
        expect(result).to.deep.equal({x: [1, 2, 3]});
        expect(diff).to.deep.equal({});
    });

    it('should throw running shift command on none array', () => {
        let source = {x: {}};
        expect(() => update(source, {x: {$shift: false}})).to.throw(Error);
    });

    it('should keep array unmodified when running shift command on empty array', () => {
        let [result, diff] = withDiff({x: []}, {x: {$shift: true}});
        expect(result).to.deep.equal({x: []});
        expect(diff).to.deep.equal({});
    });

    it('should recognize removeAt command', () => {
        let source = createSourceObject();
        let [result, diff] = withDiff(source, {x: {y: {z: {$removeAt: 1}}}});
        expect(result.x.y.z).to.deep.equal([1, 3]);
        expect(source).to.deep.equal(createSourceObject());
        result.x.y.z = [1, 2, 3];
        expect(result).to.deep.equal(source);
        expect(diff).to.deep.equal(diffOfArray(['x', 'y', 'z'], [1, 2, 3], [1, 3], 1, 1, []));
    });

    it('should throw running removeAt command on none array', () => {
        let source = {x: {}};
        expect(() => update(source, {x: {$removeAt: 1}})).to.throw(Error);
    });

    it('should keep array unmodified if removeAt index is negative', () => {
        let [result, diff] = withDiff({x: [1, 2, 3]}, {x: {$removeAt: -1}});
        expect(result).to.deep.equal({x: [1, 2, 3]});
        expect(diff).to.deep.equal({});
    });

    it('should keep array unmodified if removeAt index is out of range', () => {
        let [result, diff] = withDiff({x: [1, 2, 3]}, {x: {$removeAt: 4}});
        expect(result).to.deep.equal({x: [1, 2, 3]});
        expect(diff).to.deep.equal({});
    });

    it('should recognize remove command', () => {
        let source = createSourceObject();
        let [result, diff] = withDiff(source, {x: {y: {z: {$remove: 1}}}});
        expect(result.x.y.z).to.deep.equal([2, 3]);
        expect(source).to.deep.equal(createSourceObject());
        result.x.y.z = [1, 2, 3];
        expect(result).to.deep.equal(source);
        expect(diff).to.deep.equal(diffOfArray(['x', 'y', 'z'], [1, 2, 3], [2, 3], 0, 1, []));
    });

    it('should throw running remove command on none array', () => {
        let source = {x: {}};
        expect(() => update(source, {x: {$remove: 1}})).to.throw(Error);
    });

    it('should keep array unmodified if removing item is not in the array', () => {
        let [result, diff] = withDiff({x: [1, 2, 3]}, {x: {$remove: 4}});
        expect(result).to.deep.equal({x: [1, 2, 3]});
        expect(diff).to.deep.equal({});
    });

    it('should recognize splice command', () => {
        let source = createSourceObject();
        let [result, diff] = withDiff(source, {x: {y: {z: {$splice: [1, 1, 6, 7, 8]}}}});
        expect(result.x.y.z).to.deep.equal([1, 6, 7, 8, 3]);
        expect(source).to.deep.equal(createSourceObject());
        result.x.y.z = [1, 2, 3];
        expect(result).to.deep.equal(source);
        expect(diff).to.deep.equal(diffOfArray(['x', 'y', 'z'], [1, 2, 3], [1, 6, 7, 8, 3], 1, 1, [6, 7, 8]));
    });

    it('should throw running splice command on none array', () => {
        let source = {x: {}};
        expect(() => update(source, {x: {$splice: [1, 0, 1]}})).to.throw(Error);
    });

    it('should recognize map command', () => {
        let source = {x: [1, 2, 3]};
        let [result, diff] = withDiff(source, {x: {$map: value => value + 1}});
        expect(result).to.deep.equal({x: [2, 3, 4]});
        expect(diff).to.deep.equal(diffOfChange('x', [1, 2, 3], [2, 3, 4]));
    });

    it('should throw running map command on none array', () => {
        let source = {x: {}};
        expect(() => update(source, {x: {$map: value => value + 1}})).to.throw(Error);
    });

    it('should recognize filter command', () => {
        let source = {x: [1, 2, 3]};
        let [result, diff] = withDiff(source, {x: {$filter: value => value > 1}});
        expect(result).to.deep.equal({x: [2, 3]});
        expect(diff).to.deep.equal(diffOfChange('x', [1, 2, 3], [2, 3]));
    });

    it('should throw running filter command on none array', () => {
        let source = {x: {}};
        expect(() => update(source, {x: {$filter: value => value > 1}})).to.throw(Error);
    });

    it('should recognize reduce command', () => {
        let source = {x: [1, 2, 3]};
        let [result, diff] = withDiff(source, {x: {$reduce: (sum, value) => sum + value}});
        expect(result).to.deep.equal({x: 6});
        expect(diff).to.deep.equal(diffOfChange('x', [1, 2, 3], 6));
        let resultSubstract = update(source, {x: {$reduce: [(base, value) => base - value, 10]}});
        expect(resultSubstract).to.deep.equal({x: 4});
    });

    it('should throw running filter command on none array', () => {
        let source = {x: {}};
        expect(() => update(source, {x: {$reduce: [(sum, value) => sum + value, 0]}})).to.throw(Error);
    });

    it('should recognize merge command', () => {
        let source = createSourceObject();
        let [result, diff] = withDiff(source, {x: {y: {$merge: {a: 1, b: 2, z: source.x.y.z}}}});
        expect(result.x.y).to.deep.equal({a: 1, b: 2, z: [1, 2, 3]});
        expect(source).to.deep.equal(createSourceObject());
        expect(diff).to.deep.equal({x: {y: Object.assign(diffOfAdd('a', 1), diffOfAdd('b', 2))}});
    });

    it('should accept merge command on null objects', () => {
        let source = {x: {a: 1}};
        let extension = {b: 2};
        let [result, diff] = withDiff(source, {y: {$merge: extension}});
        expect(result).to.deep.equal({x: {a: 1}, y: {b: 2}});
        expect(result.y).not.to.equal(extension);
        expect(diff).to.deep.equal({y: diffOfAdd('b', 2)});
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
        let [result, diff] = withDiff(source, {x: {y: {$defaults: {a: 1, b: 2, z: 3}}}});
        expect(result.x.y).to.deep.equal({a: 1, b: 2, z: [1, 2, 3]});
        expect(source).to.deep.equal(createSourceObject());
        expect(diff).to.deep.equal({x: {y: Object.assign(diffOfAdd('a', 1), diffOfAdd('b', 2))}});
    });

    it('should recognize apply command', () => {
        let source = createSourceObject();
        let [result, diff] = withDiff(
            source,
            {
                tom: {jack: {$apply(x) { return x * 2; }}},
                rabbit: {$apply() { return 3; }}
            }
        );
        expect(result.tom.jack).to.equal(2);
        expect(result.rabbit).to.equal(3);
        expect(source).to.deep.equal(createSourceObject());
        expect(diff).to.deep.equal(Object.assign(diffOfChange(['tom', 'jack'], 1, 2), diffOfAdd('rabbit', 3)));
    });

    it('should recognize omit command', () => {
        let source = createSourceObject();
        let [result, diff] = withDiff(source, {tom: {jack: {$omit: true}}});
        expect(result.tom.hasOwnProperty('jack')).to.equal(false);
        expect(source).to.deep.equal(createSourceObject());
        expect(diff).to.deep.equal(diffOfRemove(['tom', 'jack'], 1));
    });

    it('should recognize omit command on array', () => {
        let source = [1, 2, 3];
        let [result, diff] = withDiff(source, {1: {$omit: true}});
        expect(result).to.deep.equal([1, 3]);
        expect(diff).to.deep.equal(diffOfRemove('1', 2));
    });

    it('should recognize composeBefore command', () => {
        let cache = [];
        let raw = value => cache.push(value);
        let before = value => {
            cache.push(value);
            return value + 1 ;
        };
        let source = {foo: raw};
        let [result, diff] = withDiff(source, {foo: {$composeBefore: before}});
        result.foo(1);
        expect(cache).to.deep.equal([1, 2]);
        expect(diff).to.deep.equal(diffOfChange('foo', raw, result.foo));
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
        let [result, diff] = withDiff(source, {foo: {$composeAfter: after}});
        result.foo(1);
        expect(cache).to.deep.equal([1, 2]);
        expect(diff).to.deep.equal(diffOfChange('foo', raw, result.foo));
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
        let [result, diff] = withDiff(source, {tom: {jack: {$omit: false}}});
        expect(result).to.deep.equal(source);
        expect(source).to.deep.equal(createSourceObject());
        expect(diff).to.deep.equal({});
    });

    it('should accept assert function in omit command', () => {
        let source = createSourceObject();
        let [result, diff] = withDiff(
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
        expect(diff).to.deep.equal(diffOfRemove(['tom', 'jack'], 1));
    });

    describe('run with first level command', () => {
        it('should work with $set', () => {
            let source = {};
            let [result, diff] = withDiff(source, {$set: 1});
            expect(result).to.equal(1);
            expect(source).to.deep.equal({});
            expect(diff).to.deep.equal(diffOfChange(null, source, 1));
        });

        it('should work with $push', () => {
            let source = [1, 2, 3];
            let [result, diff] = withDiff(source, {$push: 4});
            expect(result).to.deep.equal([1, 2, 3, 4]);
            expect(source).to.deep.equal([1, 2, 3]);
            expect(diff).to.deep.equal(diffOfArray(null, [1, 2, 3], [1, 2, 3, 4], 3, 0, [4]));
        });

        it('should work with $unshift', () => {
            let source = [1, 2, 3];
            let [result, diff] = withDiff(source, {$unshift: 0});
            expect(result).to.deep.equal([0, 1, 2, 3]);
            expect(source).to.deep.equal([1, 2, 3]);
            expect(diff).to.deep.equal(diffOfArray(null, [1, 2, 3], [0, 1, 2, 3], 0, 0, [0]));
        });

        it('should work with $map', () => {
            let source = [1, 2, 3];
            let [result, diff] = withDiff(source, {$map: x => x + 1});
            expect(result).to.deep.equal([2, 3, 4]);
            expect(diff).to.deep.equal(diffOfChange(null, [1, 2, 3], [2, 3, 4]));
        });

        it('should work with $filter', () => {
            let source = [1, 2, 3];
            let [result, diff] = withDiff(source, {$filter: x => x > 1});
            expect(result).to.deep.equal([2, 3]);
            expect(diff).to.deep.equal(diffOfChange(null, [1, 2, 3], [2, 3]));
        });

        it('should work with $reduce', () => {
            let source = [1, 2, 3];
            let [result, diff] = withDiff(source, {$reduce: (sum, x) => sum + x});
            expect(result).to.equal(6);
            expect(diff).to.deep.equal(diffOfChange(null, [1, 2, 3], 6));
        });

        it('should work with $merge', () => {
            let source = {foo: 1};
            let [result, diff] = withDiff(source, {$merge: {foo: 3, bar: 2}});
            expect(result).to.deep.equal({foo: 3, bar: 2});
            expect(source).to.deep.equal({foo: 1});
            expect(diff).to.deep.equal(Object.assign(diffOfChange('foo', 1, 3), diffOfAdd('bar', 2)));
        });

        it('should work with $defaults', () => {
            let source = {foo: 1};
            let [result, diff] = withDiff(source, {$defaults: {foo: 2, bar: 2}});
            expect(result).to.deep.equal({foo: 1, bar: 2});
            expect(source).to.deep.equal({foo: 1});
            expect(diff).to.deep.equal(diffOfAdd('bar', 2));
        });

        it('should work with $apply', () => {
            let source = 1;
            let [result, diff] = withDiff(source, {$apply(x) { return x * 2; }});
            expect(result).to.equal(2);
            expect(source).to.equal(1);
            expect(diff).to.deep.equal(diffOfChange(null, 1, 2));
        });

        it('should work with $composeBefore', () => {
            let cache = []
            let raw = value => cache.push(value);
            let before = value => {
                cache.push(value);
                return value + 1;
            };
            let [result, diff] = withDiff(raw, {$composeBefore: before});
            result(1);
            expect(cache).to.deep.equal([1, 2]);
            expect(diff).to.deep.equal(diffOfChange(null, raw, result));
        });

        it('should work with $composeAfter', () => {
            let cache = []
            let raw = value => {
                cache.push(value);
                return value + 1;
            }
            let after = value => cache.push(value);
            let [result, diff] = withDiff(raw, {$composeAfter: after});
            result(1);
            expect(cache).to.deep.equal([1, 2]);
            expect(diff).to.deep.equal(diffOfChange(null, raw, result));
        });
    });


});
