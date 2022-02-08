##  选择器引擎

### 用法

#### 参数为字符串
场景：
1. `#hello1` 普通字符串，获取DOM元素
2. `<div>`或`<div></div>`html字符串，创建一个Element对象元素

示例代码如下：

```html
<div id="hello1">hello1</div>
    <div id="hello2">hello2</div>
    <script>
        // Dom元素选择器引擎
        // 1. 参数为普通字符串
        console.log($("#hello1"));  // 普通字符串， 获取DOM元素
        console.log($("<div></div>"));  // html字符串，创建一个Element对象元素
        console.log($("<div>")); // 同$("<div></div>")
    </script>
</div>
```

#### 参数为Element对象

场景： 返回包裹Element对象的jQuery对象

示例代码如下：

```js
console.log($(document));
console.log($(this));
console.log($(window));
```

#### 参数为函数

场景：DOM加载完成(`DOMContentLoaded`)才执行回调函数

示例代码如下：
```js
$(function() { // DOM加载完成
    console.log(111)
});
$(function() { // DOM加载完成
    console.log(222)
});
$(function() { // DOM加载完成
    console.log(333)
});
```

结论：DOM加载完需要遍历执行回调函数，所以需要实现jQuery.each

#### jQuery.each

场景： 遍历数组或者对象

示例代码如下：
```js
----------------------------jQuery.each-------------------------------------
 /**
 * @param {obj} 目标源 
 * @param {callback}  回调函数
 * @param {obj} 自定义回调函数参数
 * 
*/
var obj = {name: "alan", habbit: "football"};
var arr = [
    {
        hello1: 1,
        world2: 2
    },
    {
        hello3: 3,
        world4: 4
    }
]
var result = jQuery.each(arr, function(item, index) {
    console.log(this);  // 注意this的指向，指向当前对象
    console.log(item, index);
}, ["alan", 11]);

console.log(result); 
```


#### 选择器引擎源码

示例代码如下；

```js
// jQuery初始化

(function(root) {
    var testExp = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/;  // "#hello1"=> ['#hello1', undefined, 'hello1']
    var rejectExp = /^<(\w+)\s*\/?>/;  // "<div>"=>['<div>', 'div', index: 0] 取match[1]创建DOM
    var rootjQuery;     // 保存jquery根对象，用于默认上下文
    // 构造函数
    var jQuery = function(selector, context) {
        return new jQuery.prototype.init(selector, context);  //1.  jQuery.prototype.init匿名函数的原型要指向jQuery构造函数的原型， jQuery.prototype.init.prototype = jQuery.prototype
    }
    jQuery.prototype = {
        init: function(selector, context) { // selector选择器, context 查找上下文
            var match; // 正则匹配结果
            var elem;  // 查询到的dom元素
            if(!selector) {
                return this;
            }
            if(typeof selector === "string") {  // 字符串
                // 字符串，有两种，一种是普通字符串去查找Element元素，一种是html标签字符串，如<div></div>或者<div>
                if(selector.charAt(0) === "<" && selector.charAt(selector.length -1) === ">" && selector.length >=3) { // $("<div>")或 $("<div></div>")
                    match = [null, selector, null];   // 创建dom, html标签字符串, 构建这种数组结构是跟正则匹配格式保持一致，match[1] 创建dom
                } else {
                    match =  testExp.exec(selector);     // ['#hello1', undefined, 'hello1']。match[1]等于undefined查询dom
                }
                if(match[1]) {  // 创建DOM
                    return jQuery.merge(this, jQuery.parseHTML(selector, context && context.nodeType ? context : document ))
                } else {  // 查询DOM
                    elem = document.getElementById(match[2]);  // "hello1"
                    if(elem && elem.nodeType) { // jQuery实例对象是个数组
                        this.length = 1;  // id查询
                        this[0] = elem;  // DOM元素放在第一个位置
                    }
                    this.context = document;
                    this.selector = selector;
                    return this;
                }
            } else if( selector.nodeType ) { // 对象  如：$(docuemnt)
                this.context = this[0] = selector;
                this.length = 1;
                return this;
            } else if( jQuery.isFunction(selector)) { // 函数 $(funciton(){})
                //DOMContentLoaded  事件再执行回调
                rootjQuery.ready(selector);
            }
            // console.log("I'm init working !")
        },
        css: function() {
            console.log("I'm css working !")
        },
        ready: function(fn) { // 检测DOM是否加载完毕，加载完毕再执行fn
            document.addEventListener("DOMContentLoaded", jQuery.ready);
            // 这里要加个判断，如果DOM加载完成jQuery.ready已经执行过了，该函数就需要直接执行了
            if(jQuery.isReady) { // 已经执行过了
                fn.call(document, jQuery);
            } else {
                jQuery.readyList.push(fn);   // 搜集回调函数，DOM加载完成去执行
            }
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
        isReady: false,
        readyList: [],   // 回调列表
        ready: function() { // DOM加载完成执行
            jQuery.isReady = true;  // 标记下DOM加载完成已经执行过回调了，后续添加的回调直接执行
            jQuery.each( jQuery.readyList, function(i, fn) { // 执行所有的回调函数
                fn.call(document);
            });
            jQuery.readyList = [];  // 置空回调list
        },
        /**
         * @param {obj} 目标源 
         * @param {callback}  回调函数
         * @param {obj} 自定义回调函数参数
         */
        each: function(obj, callback, args) {  // 循环遍历
            if(args) {  // 指定回调函数参数，args是个数组，所以使用apply调用回调函数
                if(jQuery.isArray(obj)) {
                    for (let i = 0; i < obj.length; i++) {
                        callback.apply(obj[i], args);   // 回调函数内部要指向当前对象
                    }
                } else {
                    for (const key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            callback.apply(obj, args);
                        }
                    }
                }
            } else {
                if(jQuery.isArray(obj)) {
                    for (let i = 0; i < obj.length; i++) {
                        callback.call(obj[i], i, obj[i]);   // 回调函数内部要指向当前对象
                    }
                } else {
                    for (const key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            callback.call(obj, key, obj[key]);
                        }
                    }
                }
            }
            return obj;
        },
        parseHTML: function(data, context) { // 创建DOM
            if(!data || typeof data !== "string") { // 不传或者不是字符串
                return null;
            }
            var parse = rejectExp.exec(data);   // 过滤掉"<div></div>"=> "div"
            return [context.createElement(parse[1])];  // 创建DOM, 包裹到数组中
        },
        isFunction: function(obj) {
            return typeof obj === 'function';
        },
        isArray: function(obj) { // 是否数组
            return Object.prototype.toString.call(obj) === '[object Array]';
        },
        isPlainObject: function(obj) { // 是否纯粹对象
            return Object.prototype.toString.call(obj) === '[object Object]';
        },
        makeArray: function(arr) { // 类数组转数组
            var result = [];   // 新建个空数组去存类数组数组
            if(arr && arr.length) {
                return jQuery.merge(result, arr);   // 把类数组合并到result
            }
        },
        merge: function(arg1, arg2) {
            var length1 = arg1.length;  // 单markArray它是个空数组，但merge是个公共方法
            var length2 = arg2.length;
            var j = 0;  // 类数组和数组公用
            if(typeof length2 === "number") { // 真正的数组
                for (; j < length2; j++) {
                    arg1[length++] = arg2[j];  // 把arg2依次赋值到arg1中
                }
            } else {
                while (arg2[j] !== undefined) { // arg2 = {"0": "alan1", "1": "alan2"}
                    arg1[length1++]  = arg2[j++];
                }
            }
            return arg1;
        }
    })
    rootjQuery = jQuery(document);
    root.jQuery = root.$ = jQuery;
    
})( this )
```
















