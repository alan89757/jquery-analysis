## $(fn)

#### 源码实现如下
```js
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
           if( jQuery.isFunction(selector)) { // 函数 $(funciton(){})
                //DOMContentLoaded  事件再执行回调
                rootjQuery.ready(selector);
            }
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