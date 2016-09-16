# san-update

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

`san-update`完全由ES2015+编写，如果环境无法满足要求，则在使用前需要添加对应的`polyfill`或`shim`，并使用[babel](http://babeljs.io)进行编译，全局至少要包含`Object.entries`函数的实现

针对`babel`除[es2015 preset](http://babeljs.io/docs/plugins/preset-es2015/)外，至少需要[function bind](http://babeljs.io/docs/plugins/transform-function-bind/)插件得以正常工作

### 基本场景

使用编译后的默认模块可以提供对象更新的功能：

```javascript
import update from 'san-update';

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
//         firstName: 'Pretty',
//         lastName: 'Wong'
//     }
// }
```

### 快捷方式

除此之外，本库还提供了一系列快捷函数，如`set`、`push`、`unshift`、`merge`、`defaults`等，这些函数可用于快速更新对象的某个属性，可以通过API文档进行查阅

### 链式调用

`chain`模块提供了链式更新一个对象的方法，使用方法如下：

```javascript
import chain from 'update/chain';

let source = {
    name: {
        firstName: 'Navy',
        lastName: 'Wong'
    },
    age: 20,
    children: ['Alice', 'Bob']
};
let target = chain(source)
    .set(['name', 'firstName'], 'Petty')
    .set('age', 21)
    .push('children', 'Cary')
    .value();

console.log(target);
// {
//     name: {
//         firstName: 'Pretty',
//         lastName: 'Wong'
//     },
//     age: 21,
//     children: ['Alice', 'Bob', 'Petty']
// }
```

`chain`后的对象每次调用对应的更新方法（如`set`、`push`等），都会得到一个新的对象，原有的对象不会受影响，比如：

```javascript
import chain from 'update/chain';

let source = {
    name: {
        firstName: 'Navy',
        lastName: 'Wong'
    },
    age: 20,
    children: ['Alice', 'Bob']
};
let updateable = chain(source);

let nameUpdated = updateable.set(['name', 'firstName'], 'Petty');
let ageUpdated = nameUpdated.set('age', 21);

console.log(nameUpdated);
// 注意age并没有受影响
//
// {
//     name: {
//         firstName: 'Pretty',
//         lastName: 'Wong'
//     },
//     age: 20,
//     children: ['Alice', 'Bob', 'Petty']
// }
```

`chain`是延迟执行的，所以假设已经对`foo`进行了操作，再对着`foo.bar`（或更深层级的属性）进行操作，会出现不可预期的行为，如以下代码：

```javascript
import chain from 'update/chain';

let source = {
    name: {
        firstName: 'Navy',
        lastName: 'Wong'
    },
    age: 20,
    children: ['Alice', 'Bob']
};

let target = chain(source)
    .set('ownedCar', {brand: 'Benz'})
    .merge('ownedCar', {type: 'C Class'});
// 注意ownedCar.type并没有生效
//
// {
//     name: {
//         firstName: 'Pretty',
//         lastName: 'Wong'
//     },
//     age: 20,
//     children: ['Alice', 'Bob', 'Petty'],
//     ownedCar: {
//         brand: 'Benz'
//     }
// }
```

这并不会给你预期的结果，所以在使用链式调用的时候要注意每个指令的路径。

## API文档


```shell
npm i
npm run doc
open doc/api/index.html
```

## 更新历史

### 1.0.0

- 从[diffy-update](https://github.com/ecomfe/diffy-update)迁移代码
- 移除`withDiff`及其相关功能
