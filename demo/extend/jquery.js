/**
 * 实现如下功能： 
 * 
 *  1. jQuery初始化
 *  2. jQuery函数对象添加方法$.extend({add: ()=>{}})
 *  3. 实现jquery浅拷贝$.extend({a: 1},{b: 2})
 *  4. 实现jquery深拷贝$.extend(true, {a: {b: 2}}, {a: {c:3}})
 *  5. 类数组转换为真正的数组markArray
 *  6. 实现选择器引擎
 *  7. 
 * 
 */

(function(root) {
    var testExp = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/;  // 匹配html标签和#号开头的标签
    var jQuery = function (selector, context) {
        return new jQuery.prototype.init(selector, context);  // init函数的原型指向jquery的原型,这就是new jQuery
    }

    jQuery.prototype = {
        init: function(selector, context) { //实现选择器引擎
            var match; // 存储正则匹配的结果 
            var elem;   // 存储element元素
            if(!selector) { // 不是选择器
                return this;
            }
            if(typeof selector === "string") { // $("#box")
                if(selector.charAt(0) === "<" && selector.charAt(selector.length-1) === ">" && selector.length >=3) { //过滤出html标签 <div>,后面会解析成div，然后通过createElement
                    match = [null, selector, null]; // 为什么要构造这种结构，因为match[1]存在说明是创建dom
                } else {
                    match = testExp.exec(selector);   // $("<div></div>")中"<div>" 或者 "#box"
                }
                if(match[1]) { // 创建dom parseHTML
                    jQuery.merge(this, jQuery.parseHTML(selector, context && context.nodeType ? context : document));
                } else { // 查询dom
                    elem = document.getElementById(match[2]);
                    if(elem && elem.nodeType) {
                        this.length = 1;   // 这里理解不是很清楚
                        this[0] = elem;  // element元素存储到类数组中
                    }
                    this.context = document;
                    this.selector = selector;
                    return this;
                }
            } else if( selector.nodeType ) { // 传入的是对象或者函数对象 this/document/window
                this.context = this[0] = selector;
                this.length = 1;
                return this;
            } else if( jQuery.isFunction(selector)) {

            }
        },
        css: function() {
            console.log("___css____");
        }
    }

    jQuery.prototype.init.prototype = jQuery.prototype;  // init函数的原型指向jquery的原型

    jQuery.extend = jQuery.prototype.extend = function() {
        var target = arguments[0] || {};
        var length = arguments.length;
        var i = 1;   // 合并的起始位置
        var deep = false; // 默认浅拷贝
        var option;  // 存储参数
        var name;  // 存储参数对象键名
        var src;      // 目标对象的值
        var copy;      // clone对象的值
        var copyIsArray;  // copy是否对象
        var clone;   // 克隆对象


        if(typeof target === "boolean") { // 如果是布尔值是判断深/浅拷贝
            deep = target;   // 存储深浅拷贝
            target = arguments[1];  // 第二个参数才是目标对象
            i =  2;   // 目标对象从第三个参数循环拷贝
        }
        if(typeof target !== "object") {  // 只有对象才能成为目标对象
            target = {};
        }
        if(length === i) {
            target = this;  // new jQuery()给实例扩展， jQuery()给函数对象添加扩展
            i--;
        }
        for (; i < length; i++) {
            if((option = arguments[i]) !== null) {
                for (name in option) {
                    src = target[name];
                    copy = option[name];
                    if(deep && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) { //深拷贝，判断 copy是对象还是数组
                        if( copyIsArray ) { // 是数组
                            copyIsArray = false;
                             console.log(deep, src, copy)
                            clone = src && jQuery.isArray(src) ? src : []; // 判断目标对象是否为数组
                        } else { // 是对象
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }
                        target[name] = jQuery.extend(deep, clone, copy);
                    } else if( copy !== undefined) {
                        target[name] = copy  // 浅拷贝
                    }
                }
            }            
        }
        return target;
    }

    jQuery.extend({
        isPlainObject: function(obj) {
            return typeof obj === "object";
        },
        isArray: function(obj) {
            return toString.call(obj) === "[object Array]";
        },
        isFunction: function(obj) {
            return toString.call(obj) === "[object Function]";
        },
        // 把类数组变成真正的数组
        markArray: function(arr) {
            debugger;
            var result = [];
            if(arr && arr.length ) {
               return jQuery.merge( result, arr); // 用一个空数组去遍历存储类数组
            }
            return undefined;
        },
        merge: function(args1, args2) {
            var i = args1.length;  
            var l = args2.length;
            var j = 0;  // 起始位置
            if(typeof l === "number") {
                for (; j < l; j++) {
                    args1[i++]  = args2[j]; // 这使用i++是为了更加通用
                }
            } else {
                while (args2[j] !== undefined) { // 把类似{"0": "alan1", "1":alan2, 2: "alan3"}对象转成数组，不清楚应用场景
                    args1[i++] = args2[j++];
                }
            }
            return args1;
        },
        parseHTML: function(data, context) {
            if(!data || typeof data !== "string") {
                return null;
            }
            // 过滤掉 "<div>"变成"div"
            var parse = rejectExp.exec(data);
            return [context.createElement(parse[1])];  // 返回jquery实例数组
        }
    })

    root.jQuery = root.$ = jQuery;  // 挂载全局对象

}(this))