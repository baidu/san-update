/**
 * san-update
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file parse property name
 * @author otakustay
 */

const LEFT_SQUARE_BRACKET = '['.charCodeAt(0);

export default source => {
    if (Array.isArray(source)) {
        return source;
    }

    // 这个简易的非状态机的实现是有缺陷的
    // 比如 a['dd.cc'].b 这种就有问题了，不过我们不考虑这种场景
    let terms = (source + '').split('.');
    let result = [];

    for (let i = 0; i < terms.length; i++) {
        let term = terms[i];
        let propAccessorStart = term.indexOf('[');


        if (propAccessorStart >= 0) {
            if (propAccessorStart > 0) {
                result.push(term.slice(0, propAccessorStart));
                term = term.slice(propAccessorStart);
            }

            while (term.charCodeAt(0) === LEFT_SQUARE_BRACKET) {
                let propAccessorEnd = term.indexOf(']');
                if (propAccessorEnd < 0) {
                    throw new Error('Property path syntax error: ' + source);
                }

                let propAccessorLiteral = term.slice(1, propAccessorEnd);
                if (/^[0-9]+$/.test(propAccessorLiteral)) {
                    // for number
                    result.push(+propAccessorLiteral);
                }
                else if (/^(['"])([^\1]+)\1$/.test(propAccessorLiteral)) {
                    // for string literal
                    result.push((new Function('return ' + propAccessorLiteral))());
                }
                else {
                    throw new Error('Property path syntax error: ' + source);
                }

                term = term.slice(propAccessorEnd + 1);
            }
        }
        else {
            result.push(term);
        }
    }

    return result;
};
