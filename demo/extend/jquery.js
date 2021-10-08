/**
 * 实现如下功能： 
 * 
 *  1. jQuery初始化
 *  2. jQuery函数对象添加方法
 *  2. 实现jquery浅拷贝
 *  3. 实现jquery深拷贝
 * 
 */

(function(root) {
    var jQuery = function () {
        return new jQuery.prototype.init();  // init函数的原型指向jquery的原型,这就是new jQuery
    }

    jQuery.prototype = {
        init: function() {

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
        }
    })

    root.jQuery = root.$ = jQuery;  // 挂载全局对象

}(this))