import {expect} from 'chai';
import {
    set,
    push,
    unshift,
    pop,
    shift,
    removeAt,
    remove,
    splice,
    map,
    filter,
    reduce,
    merge,
    defaults,
    apply,
    omit,
    composeBefore,
    composeAfter,
    applyWith
} from '../src/fp';

describe('fp module', () => {
    it('should expose set function', () => {
        let source = {x: 1};
        let target = set('x', 2)(source);
        expect(target).to.deep.equal({x: 2});
    });

    it('should expose push function', () => {
        let source = {x: [1]};
        let target = push('x', 2)(source);
        expect(target).to.deep.equal({x: [1, 2]});
    });

    it('should expose unshift function', () => {
        let source = {x: [1]};
        let target = unshift('x', 2)(source);
        expect(target).to.deep.equal({x: [2, 1]});
    });

    it('should expose pop function', () => {
        let source = {x: [1, 2]};
        let target = pop('x', true)(source);
        expect(target).to.deep.equal({x: [1]});
    });

    it('should expose shift function', () => {
        let source = {x: [1, 2]};
        let target = shift('x', array => array.length > 1)(source);
        expect(target).to.deep.equal({x: [2]});
    });

    it('should expose splice function', () => {
        let source = {x: [1]};
        let target = splice('x', 0, 1, 2)(source);
        expect(target).to.deep.equal({x: [2]});
    });

    it('should expose map function', () => {
        let source = {x: [1, 2]};
        let target = map('x', x => x * 2)(source);
        expect(target).to.deep.equal({x: [2, 4]});
    });

    it('should expose filter function', () => {
        let source = {x: [1, 2]};
        let target = filter('x', x => x % 2 === 0)(source);
        expect(target).to.deep.equal({x: [2]});
    });

    it('should expose reduce function', () => {
        let source = {x: [1, 2]};
        let target = reduce('x', (result, x) => result + x, 4)(source);
        expect(target).to.deep.equal({x: 7});
    });

    it('should expose merge function', () => {
        let source = {x: {y: 1}};
        let target = merge('x', {y: 3, z: 2})(source);
        expect(target).to.deep.equal({x: {y: 3, z: 2}});
    });

    it('should expose defaults function', () => {
        let source = {x: {y: 1}};
        let target = defaults('x', {y: 3, z: 2})(source);
        expect(target).to.deep.equal({x: {y: 1, z: 2}});
    });
    it('should expose apply function', () => {
        let source = {x: 1};
        let target = apply('x', x => x * 3)(source);
        expect(target).to.deep.equal({x: 3});
    });

    it('should expose omit function', () => {
        let source = {x: 1};
        let target = omit('x', x => x < 2)(source);
        expect(target).to.deep.equal({});
    });

    it('should expose composeBefore function', () => {
        let result = [];
        let source = {x: () => result.push(1)};
        let target = composeBefore('x', () => result.push(2))(source);
        target.x();
        expect(result).to.deep.equal([2, 1]);
    });

    it('should expose composeAfter function', () => {
        let result = [];
        let source = {x: () => result.push(1)};
        let target = composeAfter('x', () => result.push(2))(source);
        target.x();
        expect(result).to.deep.equal([1, 2]);
    });

    it('should expose applyWith function', () => {
        let source = {x: 1, y: 2, z: 3};
        let target = applyWith(
            'x',
            [o => o.y, o => o.z],
            (y, z, x) => x + y * z
        )(source);
        expect(target).to.deep.equal({x: 7, y: 2, z: 3});
    });
});
