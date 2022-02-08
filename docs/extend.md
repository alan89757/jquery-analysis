##  jQuery.extend

### 先看extend的用法

#### 合并任意两个对象
```js
// 1. 合并任意两个对象
var obj1 = {
    name: "alan1"
}
var obj2 = {
    age: 20
}
console.log($.extend(obj1, obj2));  // {name: 'alan1', age: 20}
console.log(obj1);   // {name: 'alan1', age: 20}
```

#### 添加静态方法
```js
// 2. jQuery函数对象添加方法
$.extend({
    work: function() {
        console.log("I'm working")
    }
})
$.work();  // I'm working
```

#### 深拷贝
```js
 // 3. 深拷贝
var list1 = {
    name: ["alan1", "alan2", "alan3"],
    info: {
        hello1: 1
    }
}
var list2 = {
    name: ["alan4", "alan5"],
    info: {
        hello2: 2
    }
}
console.log($.extend(true, list1, list2));  // {"name":["alan4","alan5","alan3"],"info":{"hello1":1,"hello2":2}}
```


### 浅拷贝
```js
// jQuery初始化
(function(root) {
    // 构造函数
    var jQuery = function() {
        return new jQuery.prototype.init();  //1.  jQuery.prototype.init匿名函数的原型要指向jQuery构造函数的原型， jQuery.prototype.init.prototype = jQuery.prototype
    }
    jQuery.prototype = {
        init: function() {
            console.log("I'm init working !")
        },
        css: function() {
            console.log("I'm css working !")
        }
    }
    jQuery.prototype.init.prototype = jQuery.prototype;  // init匿名函数原型指向jQuery构造函数原型

     // 2. jQuery函数对象和原型添加extend方法
    jQuery.extend = jQuery.prototype.extend = function() {
        var target = arguments[0] || {};  // 第一个参数是目标对象，所有参数对象都会被合并到第一个参数
        var length = arguments.length;  // 参数长度
        var i = 1;  // 因目标对象有单独的处理逻辑，所以下标从1开始，for循环待合并对象
        var options;  // 临时变量
        var name;  // 临时变量
        var src;   // 目标对象
        var copy;   // 待合并对象

        if(typeof target !== "object") {
            target = {};    // target非对象给个默认值{}
        }
        // 只有一个参数，说明给jquery函数对象或者实例对象扩展方法
        if(length == i) {
            target = this;  // this函数对象或实例对象，完美解决在目标对象扩展方法的需求
            i--;   // 跳过后面的for循环合并对象
        }

        for (; i < length; i++) {
            if((options = arguments[i])  !== null) {
                for (name in options) {
                    if (options.hasOwnProperty(name)) {
                        src = target[name];  // 目标对象
                        copy = options[name];   // 待合并对象
                        if(copy !== undefined) {  // 浅复制
                            target[name] = copy;
                        }
                    }
                }
            }
        }
        return target;
    }

    root.jQuery = root.$ = jQuery;
    
})( this )
```
结论：浅复制是比较简单的，参数(`从第2个参数开始`)通过for循环遍历出来赋值到目标对象上（`第一个参数`）


### 深拷贝

#### extend用法，实例代码如下：

```js
var list1 = {
    name: ["alan1", "alan2", "alan3"],
    info: {
        hello1: 1
    }
}

var list2 = {
    name: ["alan4", "alan5"],
    info: {
        hello2: 2
    }
}

console.log($.extend(true, list1, list2));  // {"name":["alan4","alan5","alan3"],"info":{"hello1":1,"hello2":2}}
```


```js
-------------------------------------------深拷贝完整版-----------------------------------------
// jQuery初始化

(function(root) {
    // 构造函数
    var jQuery = function() {
        return new jQuery.prototype.init();  //1.  jQuery.prototype.init匿名函数的原型要指向jQuery构造函数的原型， jQuery.prototype.init.prototype = jQuery.prototype
    }
    jQuery.prototype = {
        init: function() {
            console.log("I'm init working !")
        },
        css: function() {
            console.log("I'm css working !")
        }
    }
    jQuery.prototype.init.prototype = jQuery.prototype;  // init匿名函数原型指向jQuery构造函数原型

     // 2. jQuery函数对象和原型添加extend方法
    jQuery.extend = jQuery.prototype.extend = function() {
        var target = arguments[0] || {};  // 第一个参数是目标对象，所有参数对象都会被合并到第一个参数
        var length = arguments.length;  // 参数长度
        var i = 1;  // 因目标对象有单独的处理逻辑，所以下标从1开始，for循环待合并对象
        var options;  // 临时变量
        var name;  // 临时变量
        var src;   // 目标对象
        var copy;   // 待合并对象
        var deep = false; // 默认浅拷贝
        var copyIsArray = false;  // 待合并对象是否是数组
        var clone;  // 临时保存目标对象

        if(typeof target === "boolean") { // 第一个参数是boolean值表示配置深浅拷贝
            deep = target;
            target = arguments[1];
            i++;    // 待合并对象下标值从2开始
        }

        if(typeof target !== "object") {
            target = {};    // target非对象给个默认值{}
        }
        // 只有一个参数，说明给jquery函数对象或者实例对象扩展方法
        if(length == i) {
            target = this;  // this函数对象或实例对象，完美解决在目标对象扩展方法的需求
            i--;   // 跳过后面的for循环合并对象
        }

        for (; i < length; i++) {
            if((options = arguments[i])  !== null) {
                for (name in options) {
                    if (options.hasOwnProperty(name)) {
                        src = target[name];  // 目标对象
                        copy = options[name];   // 待合并对象
                        if(deep && ((copyIsArray = jQuery.isArray(copy)) || jQuery.isPlainObject(copy))) {  // deep是true,且待合并对象是数组或者纯粹对象
                            if(copyIsArray) { // 待合并对象是数组
                                copyIsArray = false; // 因为是全局变量，重置为默认值
                                clone = src && jQuery.isArray(src) ? src : []; // 深拷贝，目标对象数据类型跟待合并对象类型保持一致，参考jquery源码
                            } else {
                                clone = src && jQuery.isPlainObject(src) ? src : {};
                            }
                            target[name] = $.extend(deep, clone, copy);  // 再递归一次，直到基本数据类型走浅复制出口返回对应的值
                        } else if(copy !== undefined) {  // 浅复制
                            target[name] = copy;
                        }
                    }
                }
            }
        }
        return target;
    }

    // 给jQuery函数对象新增静态方法
    jQuery.extend({
        isArray: function(obj) { // 是否数组
            return Object.prototype.toString.call(obj) === '[object Array]';
        },
        isPlainObject: function(obj) { // 是否纯粹对象
            return Object.prototype.toString.call(obj) === '[object Object]';
        }
    })
    root.jQuery = root.$ = jQuery;
    
})( this )
```