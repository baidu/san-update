# san-update
[![building status](https://img.shields.io/travis/ecomfe/san-update.svg?style=flat)](https://travis-ci.org/ecomfe/san-update)
[![Coverage Status](https://img.shields.io/coveralls/ecomfe/san-update.svg?style=flat)](https://coveralls.io/github/ecomfe/san-update)
[![NPM version](https://img.shields.io/npm/v/san-update.svg?style=flat)](https://www.npmjs.com/package/san-update)


本库来源于[diffy-update](https://github.com/ecomfe/diffy-update)，在此基础上梳理了API并移除了差异计算功能，使之成为纯粹的对象更新工具，并纳入san体系中

本库实现了一个更新对象的函数，同时随更新过程输出新旧对象的差异结构

## 为何要开发这个库

在当前的前端形势下，不可变（Immutable）的概念开始出现在开发者的视野中，以不可变作为第一考虑的设计和实现会让程序普遍拥有更好的可维护性

而在不可变的前提下，我们不能对一个对象的属性进行直接的操作（赋值、修改、删除等），因此更新一个对象变得复杂：

```javascript
let newObject = clone(source);
newObject.foo = 1;
```

如果我们需要修改更深层次的属性，则会变得更为复杂：

```javascript
let newObject = clone(source);
newObject.foo = clone(newObject.foo);
newObject.foo.bar = 1;
// 有其它属性都需要依次操作
```

这是相当麻烦的，每次更新都会需要大量的代码，因此偷懒的话我们会用深克隆来搞定这事：

```javascript
let newObject = deepClone(source);
newObject.foo.bar = 1;
// 其它修改
```

但是深克隆存在一些严重的问题：

1. 性能不好，我们只更新一层属性的情况下，原对象的n层属性都要经过克隆操作，有大量无谓的遍历和对象创建开销
2. 遇到环引用无法处理


基于此，社区上出现了一些用声明式的指令更新对象的辅助库，比如[React Immutability Helpers](https://facebook.github.io/react/docs/update.html)，这些库封装了上面的逻辑，且选择了效率最优（仅复制未更新的属性，不需要深克隆）的方案

但是社区的库普遍存在一些问题，如：

1. 指令不够。除最基本的`set`、`push`、`unshift`、`merge`等功能外，其它功能难以方便地补充
2. 使用不便。当需要对一个对象的多个属性进行更新时，组装一个复杂的更新指令并不容易

`san-update`希望在社区经验的基础之上，通过提供更强大的功能和方便的使用方式（如链式调用）来简化基于不可变对象的系统开发

## 使用

### 前置环境

`san-update`完全由ES2015+编写，如果环境无法满足要求，则在使用前需要添加对应的`polyfill`或`shim`，并使用[babel](http://babeljs.io)进行编译。

针对`babel`至少需要[es2015 preset](http://babeljs.io/docs/plugins/preset-es2015/)

### 基本场景

`update`函数可以提供对象更新的功能：

```javascript
import {update} from 'san-update';

let source = {
    name: {
        firstName: 'Navy',
        lastName: 'Wong'
    }
};
let target = update(source, {name: {firstName: {$set: 'Petty'}}});

console.log(target);
// {
//     name: {
//         firstName: 'Petty',
//         lastName: 'Wong'
//     }
// }
```

### 快捷方式

除此之外，本库还提供了一系列快捷函数，如`set`、`push`、`unshift`、`merge`、`defaults`等，这些函数可用于快速更新对象的某个属性，可以通过API文档进行查阅

#### applyWith

除与`update`能接受的指令相同的快捷函数之外，还提供一个`applyWith`函数，该函数的声明如下：

```javascript
{Object} applyWith(
    {Object} source,
    {string?|Array.<string>|number?|Array.<number>} path,
    {Function|Array.<Function>} selectors,
    {Function} factory
)
```

这个函数与`apply`功能类似，区别是可以通过`selectors`属性指定一个或多个选择器，每个选择器接收`source`对象并返回一个值，这些值将作为`factory`函数的前n个参数，并加上需要更新的属性的当前值作为最后一个参数调用`factory`函数，将函数返回值作为属性的新值

```javascript
let data = {
    values: [1, 2, 3],
    multiple: 3,
    result: 10
};
let newData = applyWith(
    data, // input
    'result', // path
    [o => o.values, o => o.multiple], // dependencies
    (values, multiple, result) => values.reduce((sum, i) => sum + 1) * multiple + result
);
console.log(newData);
// {
//     values: [1, 2, 3],
//     multiple: 3,
//     result: 28 <-- (1 + 2 + 3) * 3 + 10
// }
```

需要注意的是，`applyWith`函数仅通过快捷方式提供，在`update`、`macro`和`chain`模块上均没有该功能。

### 可用指令

以下指令可以在`update`方法中使用，同时也有同名的对应快捷方式函数

#### $set

用于将属性的值设置为提供的新值

```javascript
import {update, set} from 'san-update';

let source = {
    value: 1
};

update(source, {value: {$set: 2}});
set(source, 'value', 2);
// {
//     value: 2
// }
```

#### $push

用于在类型为数组的属性末尾增加一个元素，如果属性的类型不是数组，则会抛出异常

```javascript
import {update, push} from 'san-update';

let source = {
    count: 1,
    values: [1, 2]
};

update(source, {values: {$push: 3}});
push(source, 'values', 3);
// {
//     count: 1,
//     values: [1, 2, 3]
// }

update(source, {count: {$push: 2}});
push(source, 'count', 2);
// Error: Usage of $push command on non array object is forbidden.
```

#### $unshift

用于在类型为数组的属性头部增加一个元素，如果属性的类型不是数组，则会抛出异常

```javascript
import {update, unshift} from 'san-update';

let source = {
    count: 1,
    values: [1, 2]
};

update(source, {values: {$unshift: 0}});
unshift(source, 'values', 0);
// {
//     count: 1,
//     values: [0, 1, 2]
// }

update(source, {count: {$unshift: 0}});
unshift(source, 'count', 0);
// Error: Usage of $unshift command on non array object is forbidden.
```

#### $pop

用于移除类型为数组的属性的最后一个元素，如果属性的类型不是数组，则会抛出异常

`$pop`指令对应的值可以为一个`boolean`类型的值，当其值为`true`时会执行移除操作，值为`false`时则不进行更新。同时值也可以为一个函数，该函数接受属性当前的值并返回一个`boolean`类型的值用于判断是否进行更新

```javascript
import {update, pop} from 'san-update';

let source = {
    count: 1,
    values: [1, 2]
};

update(source, {values: {$pop: true}});
// {
//     count: 1,
//     values: [1]
// }
pop(source, 'values', array => array.length > 2);
// 因函数执行返回为false，对象不会更新
// {
//     count: 1,
//     values: [1, 2]
// }

// 无论值为true还是false，类型检查都会进行
update(source, {count: {$pop: true}});
pop(source, 'count', false);
// Error: Usage of $pop command on non array object is forbidden.
```

#### $shift

用于移除类型为数组的属性的第一个元素，如果属性的类型不是数组，则会抛出异常

`$shift`指令对应的值可以为一个`boolean`类型的值，当其值为`true`时会执行移除操作，值为`false`时则不进行更新。同时值也可以为一个函数，该函数接受属性当前的值并返回一个`boolean`类型的值用于判断是否进行更新

```javascript
import {update, shift} from 'san-update';

let source = {
    count: 1,
    values: [1, 2]
};

update(source, {values: {$shift: true}});
// {
//     count: 1,
//     values: [2]
// }
shift(source, 'values', array => array.length > 2);
// 因函数执行返回为false，对象不会更新
// {
//     count: 1,
//     values: [1, 2]
// }

// 无论值为true还是false，类型检查都会进行
update(source, {count: {$shift: true}});
shift(source, 'count', false);
// Error: Usage of $shift command on non array object is forbidden.
```

#### $removeAt

用于移除类型为数组的属性中指定位置的元素，如果属性的类型不是数组，则会抛出异常

如果提供的索引在数组范围之外（值为负或超出数组长度），则不会进行更新

```javascript
import {update, removeAt} from 'san-update';

let source = {
    count: 1,
    values: [1, 2]
};

update(source, {values: {$removeAt: 1}});
// {
//     count: 1,
//     values: [1]
// }
removeAt(source, 'values', 2);
// 因超出范围，不会进行更新
// {
//     count: 1,
//     values: [1, 2]
// }

update(source, {count: {$removeAt: 1}});
removeAt(source, 'count', 1);
// Error: Usage of $removeAt command on non array object is forbidden.
```

#### $remove

用于移除类型为数组的属性中的指定元素，如果属性的类型不是数组，则会抛出异常

如果数组中出现多次指定的元素，则**只会移除第一个**，如果未找到元素，则不进行更新

```javascript
import {update, remove} from 'san-update';

let source = {
    count: 1,
    values: [1, 2]
};

update(source, {values: {$remove: 1}});
// {
//     count: 1,
//     values: [2]
// }
remove(source, 'values', 3);
// 未找到元素则不进行更新
// {
//     count: 1,
//     values: [1, 2]
// }

update(source, {count: {$remove: 1}});
remove(source, 'count', 1);
// Error: Usage of $remove command on non array object is forbidden.
```

#### $splice

用于对类型为数组的属性进行splice操作，如果属性的类型不是数组，则会抛出异常

`$splice`指令接收的值为一个数组，其内容与`Array#splice`方法相同，分别为`[start, deleteCount, ...items]`

```javascript
import {update, splice} from 'san-update';

let source = {
    count: 1,
    values: [1, 2]
};

update(source, {values: {$splice: [1, 1, 3, 4, 5]}});
// {
//     count: 1,
//     values: [1, 3, 4, 5]
// }
splice(source, 'values', [1, 0, 3, 4, 5]);
// {
//     count: 1,
//     values: [1, 3, 4, 5, 2]
// }

update(source, {count: {$splice: [1, 0, 2]}});
splice(source, 'count', [1, 0, 2]);
// Error: Usage of $splice command on non array object is forbidden.
```

#### $map

用于对类型为数组的属性进行map操作，如果属性的类型不是数组，则会抛出异常

```javascript
import {update, map} from 'san-update';

let source = {
    count: 1,
    values: [1, 2]
};

update(source, {values: {$map: value => value + 1}});
map(source, 'values', value => value + 1);
// {
//     count: 1,
//     values: [2, 3]
// }

update(source, {count: {$map: value => value + 1}});
map(source, 'count', value => value + 1);
// Error: Usage of $map command on non array object is forbidden.
```

#### $filter

用于对类型为数组的属性进行filter操作，如果属性的类型不是数组，则会抛出异常

```javascript
import {update, filter} from 'san-update';

let source = {
    count: 1,
    values: [1, 2]
};

update(source, {values: {$filter: value => value > 1}});
filter(source, 'values', value => value > 1);
// {
//     count: 1,
//     values: [2]
// }

update(source, {count: {$filter: value => value > 1}});
filter(source, 'count', value => value > 1);
// Error: Usage of $filter command on non array object is forbidden.
```

#### $reduce

用于对类型为数组的属性进行reduce操作，如果属性的类型不是数组，则会抛出异常

```javascript
import {update, reduce} from 'san-update';

let source = {
    count: 1,
    values: [1, 2]
};

update(source, {values: {$reduce: [(sum, value) => sum + value, 0]}});
// 也支持没有initialValue
reduce(source, 'values', (sum, value) => sum + value);
// {
//     count: 1,
//     values: 3
// }

update(source, {count: {$reduce: (sum, value) => sum + value}});
reduce(source, 'count', (sum, value) => sum + value);
// Error: Usage of $reduce command on non array object is forbidden.
```

#### $merge

用于在属性中合并相就的键值，`$merge`指令使用浅合并

```javascript
import {update, merge} from 'san-update';

let source = {
    user: {
        name: 'Alice'
    }
};

update(source, {user: {$merge: {name: 'Bob', age: 14}}});
merge(source, 'user', {name: 'Bob', age: 14});
// {
//     user: {
//         name: 'Bob',
//         age: 14
//     }
// }
```

#### $defaults

用于在向属性中不存在的键填充值，`$defaults`指令使用浅合并

```javascript
import {update, defaults} from 'san-update';

let source = {
    user: {
        name: 'Alice'
    }
};

update(source, {user: {$defaults: {name: 'Bob', age: 14}}});
defaults(source, 'user', {name: 'Bob', age: 14});
// {
//     user: {
//         name: 'Alice',
//         age: 14
//     }
// }
```

#### $apply

用于通过一个函数对属性的值进行更新，提供的函数接收属性当前值作为唯一的参数，其返回值作为属性的新值

```javascript
import {update, apply} from 'san-update';

let source = {
    value: 1
};

update(source, {value: {$apply: value => value + 1}});
apply(source, 'value', value => value + 1);
// {
//     user: {
//         value: 2
//     }
// }
```

#### $omit

用于移除一个属性

`$omit`指令对应的值可以为一个`boolean`类型的值，当其值为`true`时会执行移除操作，值为`false`时则不进行更新。同时值也可以为一个函数，该函数接受属性当前的值并返回一个`boolean`类型的值用于判断是否进行更新

```javascript
import {update, omit} from 'san-update';

let source = {
    value: 1
};

update(source, {value: {$omit: true}});
// {}
omit(source, 'value', value => value > 1);
// 因为函数返回false，不会进行更新
// {
//     value: 1
// }
```

#### $composeBefore

用于更新类型为函数的属性，将该函数进行封装，封装后的函数先执行`$composeBefore`指令接收的函数，后续使用该函数返回的值作为参数执行原函数。如果属性的类型不是函数，则会抛出异常

```javascript
import {update, composeBefore} from 'san-update';

let source = {
    name: 'app',
    log(text) {
        console.log(text);
    }
};
let prefix = module => text => {
    console.log(`[${module}]`);
    return '    ' + text;
};

let sysLogger = update(source, {log: {$composeBefore: prefix('System')}});
sysLogger.log('Hello World');
// [System]
//     Hello World
let appLogger = composeBefore(source, 'log', prefix('Application'));
appLogger.log('Hello World');
// [Application]
//     Hello World

update(source, {name: {$composeBefore: prefix('System')}});
composeBefore(source, 'name', prefix('System'));
// Error: Usage of $composeBefore command on non function object is forbidden.
```

#### $composeAfter

用于更新类型为函数的属性，将该函数进行封装，封装后的函数先执行原函数，后续使用原函数返回值作为参数执行`$composeAfter`指令接收的函数。如果属性的类型不是函数，则会抛出异常

```javascript
import {update, composeAfter} from 'san-update';

let source = {
    name: 'app',
    log(text) {
        console.log(text);
    }
};
let time = dateOnly => {
    let now = new Date();
    if (dateOnly) {
        console.log(`    @${now.toLocaleDateString()}`);
    }
    else {
        console.log(`    @${now.toLocaleString()}`);
    }
};

let longTimeLogger = update(source, {log: {$composeAfter: time(false)}});
longTimeLogger.log('Hello World');
// Hello World
//     @2017/3/17 下午4:35:14
let shortTimeLogger = composeBefore(source, 'log', time(true));
shortTimeLogger.log('Hello World');
// Hello World
//     @2017/3/17

update(source, {name: {$composeAfter: time(true)}});
composeAfter(source, 'name',time(true));
// Error: Usage of $composeAfter command on non function object is forbidden.
```

### 链式调用

`chain`模块提供了链式更新一个对象的方法，可以使用`chain`或者`immutable`来引入这一函数，使用方法如下：

```javascript
import {immutable} from 'san-update';

let source = {
    name: {
        firstName: 'Navy',
        lastName: 'Wong'
    },
    age: 20,
    children: ['Alice', 'Bob']
};
let target = immutable(source)
    .set('name.firstName', 'Petty')
    .set('age', 21)
    .push('children', 'Cary')
    .value();

console.log(target);
// {
//     name: {
//         firstName: 'Petty',
//         lastName: 'Wong'
//     },
//     age: 21,
//     children: ['Alice', 'Bob', 'Cary']
// }
```

链式调用后的对象每次调用对应的更新方法（如`set`、`push`等），都会得到一个新的对象，原有的对象不会受影响，比如：

```javascript
import {immutable} from 'san-update';

let source = {
    name: {
        firstName: 'Navy',
        lastName: 'Wong'
    },
    age: 20,
    children: ['Alice', 'Bob']
};
let updateable = immutable(source);

let nameUpdated = updateable.set('name.firstName', 'Petty');
let ageUpdated = nameUpdated.set('age', 21);

console.log(nameUpdated.value());
// 注意age并没有受影响
//
// {
//     name: {
//         firstName: 'Petty',
//         lastName: 'Wong'
//     },
//     age: 20,
//     children: ['Alice', 'Bob']
// }
```

`chain`是延迟执行的，所以假设已经对`foo`进行了操作，再对着`foo.bar`（或更深层级的属性）进行操作，会出现不可预期的行为，如以下代码：

```javascript
import {immutable} from 'san-update';
// 也可以使用以下别名，为同一个函数
// import {chain} from 'san-update';

let source = {
    name: {
        firstName: 'Navy',
        lastName: 'Wong'
    },
    age: 20,
    children: ['Alice', 'Bob']
};

let target = immutable(source)
    .set('ownedCar', {brand: 'Benz'})
    .merge('ownedCar', {type: 'C Class'})
    .value();
// 注意ownedCar.type并没有生效
//
// {
//     name: {
//         firstName: 'Navy',
//         lastName: 'Wong'
//     },
//     age: 20,
//     children: ['Alice', 'Bob'],
//     ownedCar: {
//         brand: 'Benz'
//     }
// }
```

这并不会给你预期的结果，所以在使用链式调用的时候要注意每个指令的路径。

### 使用builder构建更新函数

当一个更新指令会被经常使用时，我们常用的方式是将这个指令保存为一个常量，以避免每一次构建指令的消耗。但是任何对象更新库的指令都是一个不容易理解的底层数据结构，因此为了更方便直观地构建一个可被反复使用的更新对象的函数，`san-update`提供`builder`功能来声明更新的函数。

`builder`的使用方式和链式调用相似，区别在于构造时不需要传入待更新的对象，而其最终返回的函数则是一个接收待更新对象的函数。

```javascript
import {builder} from 'san-update';
// 也可以使用以下别名，均为同一个函数
// import {macro} from 'san-update';
// import {updateBuilder} from 'san-update';

// 构建一个用于升级当前角色的函数
let levelUp = builder()
    .apply('level', level => level + 1)
    .apply('hp', hp => Math.round(hp * 1.19)) // 增加19%的HP
    .apply('str', str => str + 2)) // 增加2点力量
    .apply('int', int => int + 1)) / 增加1点智力
    .apply('agi', agi => agi + 5)) // 增加5点敏捷
    .apply('bag.capacity', capacity => capacity + 2) // 背包增加2格空间
    .set('debuff', []) // 清除所有负面状态
    .build(); // 最终生成更新的函数

let hero = game.getMyHero();
console.log(hero);
// {
//     level: 1
//     hp: 100,
//     str: 4,
//     int: 2,
//     agi: 5,
//     bag: {
//         items: [],
//         capacity: 12
//     },
//     debuff: []
// }

hero = levelUp(hero);
console.log(hero);
// {
//     level: 2
//     hp: 119,
//     str: 6,
//     int: 3,
//     agi: 10,
//     bag: {
//         items: [],
//         capacity: 14
//     },
//     debuff: []
// }

hero = levelUp(hero);
console.log(hero);
// {
//     level: 3
//     hp: 142,
//     str: 8,
//     int: 4,
//     agi: 15,
//     bag: {
//         items: [],
//         capacity: 16
//     },
//     debuff: []
// }
```

`builder#build`返回的更新函数上还附有`withDiff`函数，可以使用该函数生成差异对象。除此之外，也可以使用`builder#buildWithDiff`直接返回带有差异功能的更新函数。

```javascript
import {builder} from 'san-update';
// 也可以使用以下别名，均为同一个函数
// import {macro} from 'san-update';
// import {updateBuilder} from 'san-update';

let source = {
    name: {
        firstName: 'Navy',
        lastName: 'Wong'
    }
};

let update = builder().set('name.firstName', 'Petty').build();
let target = update.withDiff(source);
// 也可以这么写：
// let withDiff = builder().set('name.firstName', 'Petty').buildWithDiff();
// let target = withDiff(source);

console.log(target);
// {
//     name: {
//         firstName: 'Petty',
//         lastName: 'Wong'
//     }
// }

console.log(diff);
// {
//     name: {
//         firstName: {
//             $change: 'change',
//             oldValue: 'Navy',
//             newValue: 'Petty'
//         }
//     }
// }
```

与链式调用相同，`builder`的每一个操作都会生成一个全新的对象，原有的对象不会受到影响

### 函数式编程

`san-update/fp`模块提供了与快捷方式同名的一系列函数，这些函数与快捷方式不同的是不接收`source`参数，而是先使用其它参数生成一个更新用的函数，随后再调用该函数提供`source`参数来获得更新后的对象。这些函数可以很方便地用于函数式编程：

```javascript
import {set} from 'san-update/fp';

let setName = set('name', 'Gray Zhang');
let user = {
    name: 'Gary Wang'
};
let newUser = setName(user);
console.log(newUser);
// {
//     name: 'Gray Zhang'
// }
```

上面的代码等效于以下直接使用快捷函数的代码，区别在于`setName`可以被多次复用：

```javascript
import {set} from 'san-update';

let user = {
    name: 'Gary Wang'
};
let newUser = set(user, 'name', 'Gray Zhang');
console.log(newUser);
// {
//     name: 'Gray Zhang'
// }
```

使用`flow`或者`compose`等函数组合的功能可以非常方便地构建出一个完整表达业务逻辑的更新函数：

```javascript
import {set, apply, push} from 'san-update/fp';
import {flow} from 'lodash'; // 使用lodash.flow组合多个函数

let setRole = set('role', 'Skilled Warrior');
let increaseLevel = apply('level', level => level + 1);
let addBattleSkill = push('skills.battle', 'Bloody Massacre');
let levelUpToTen = flow(setName, increaseLevel, addBattleSkill);

let newCharacter = levelUpToTen(currentCharacter);
```

### 差异获取

`withDiff`函数可在更新对象的同时提供一个新旧对象的差异：

```javascript
import {withDiff} from 'san-update';

let source = {
    name: {
        firstName: 'Navy',
        lastName: 'Wong'
    }
};
let [target, diff] = withDiff(source, {name: {firstName: {$set: 'Petty'}}});

console.log(target);
// {
//     name: {
//         firstName: 'Petty',
//         lastName: 'Wong'
//     }
// }

console.log(diff);
// {
//     name: {
//         firstName: {
//             $change: 'change',
//             oldValue: 'Navy',
//             newValue: 'Petty'
//         }
//     }
// }
```

差异是一个与更新的对象结构相似的对象，当一个属性有更新时，该属性下会存在名为`$change`的属性，该属性标识这个对象有更新的同时也提供了更新的形式，其值可分为`"change"`、`"add"`或`"remove"`。因此，为了避免后续对

一个差异对象的结构如下：

```javascript
{
    $change: {string},
    oldValue: {*},
    newValue: {*},
    splice: {
        index: {number},
        deleteCount: {number},
        insertions: {Array}
    }
}
```

其中`oldValue`和`newValue`标记更新前后的值，当`$change`为`"remove"`时`newValue`的值恒定为`undefined`，当`$change`为`"add"`时则`oldValue`的值恒定为`undefined`。因此，为了避免后续对

如果使用`push`、`unshift`、`splice`、`pop`、`shift`、`removet`、`removeAt`指令对数组进行了操作，则会在差异对象中生成一个`splice`属性，其中的`index`、`deleteCount`、`insertions`表达了更新的位置、删除的数量、插入的新元素。需要注意的是如果使用`apply`、`set`等操作对数组进行更新则不会有`splice`属性产生，数组将被当作普通的对象仅提供新旧值。

## 细节

### 关于无效更新

假设有一个对象：

```javascript
let foo = {x: 1};
```

对其进行一次更新，但并没有修改其任何属性的值：

```javascript
import {set} from 'san-update';

let bar = set(foo, 'x', 1);
```

这样的更新被称为“无效更新”。

在`san-update`中，**无效更新会返回一个全新的对象**，即`bar === foo`为`false`。

`san-update`尊重JavaScript这一语言的弱类型特性，因此不会假设使用了本库的环境是完全Immutable的，即不去假设`foo.x = 2`这样的代码**永不存在**。因此，为了避免后续对`foo`的非Immutable修改影响到`bar`的结构和内容，`san-update`会在任何时候都创建一个新的对象，无论这一更新是否为无效更新。

### 关于属性缺失

当对一个对象进行深度的操作时，可能会遇上属性缺失的情况：

```javascript
import {set} from 'san-update';

let foo = {};
let bar = set(foo, 'x.y', 1);
```

如上代码，`foo`对象并没有`x`属性，此时对`x.y`进行修改会在路径访问上出现一个空缺。

在[React Immutability Helpers](https://facebook.github.io/react/docs/update.html)中，这样的操作是会导致异常的。但在`san-update`中并不会，`san-update`会补齐访问路径中的所有属性，即上面的代码会正常返回一个`{x: {y: 1}}`的对象。

也因为这一策略，`san-update`无法成为一个校验静态类型结构的工具，如果与系统配合使用，还需要自行选择[react-types](https://www.npmjs.com/package/react-types)或[JSON Schema](http://json-schema.org/)等工具确保类型的静态性和正确性。

但需要注意的是，`san-update`只会用对象（`{}`）去补上不存在的属性，因此如果你期望一个数组的话，`san-update`得到的结果会与你的预期不符：

```javascript
import {push} from 'san-update';

let foo = {};
let bar = push(foo, 'x', 1); // Error: 没有push方法
```

## API文档


```shell
npm i
npm run doc
open doc/api/index.html
```

## 更新历史

### 2.1.0

- 快捷方式增加了`pop`、`shift`、`removeAt`、`remove`函数
- 增加`applyWith`快捷函数
- 增加了函数式编程`fp`模块

### 2.0.0

本版本源码与2.0.0-rc.1一到

- 修复相关文档内容

### 2.0.0-rc.1

- 添加`withDiff`函数提供计算对象差异的功能
- 添加`$pop`、`$shift`、`$remove`、`$removeAt`指令
- 允许使用诸如`"foo.bar[2]"`的字符串表达属性的访问路径
- 为`macro`添加别名`builder`和`updateBuilder`
- **[BREAKING]**移除`$slice`指令
- **[BREAKING]**`$invoke`指令更名为`$apply`

### 1.4.0

- 添加`$map`、`$filter`、`$reduce`、`$slice`、`$composeBefore`、`$composeAfter`指令

### 1.3.0

- 在非数组上调用`$push`、`$unshift`、`$splice`指令将抛出异常
- 修复了`$merge`指令在原属性存在和不存在时的行为差异

### 1.2.0

- 添加`macro`功能用于构建更新函数

### 1.1.1

- 修复`omit`快捷函数未导出的BUG

### 1.1.0

- 添加`immutable`作为`chain`的别名
- 修复内部`clone`函数不会复制原型属性的错误
- 添加了`omit`指令

### 1.0.0

- 从[diffy-update](https://github.com/ecomfe/diffy-update)迁移代码
- 移除`withDiff`及其相关功能
- 构建入口模块
