(function(root){
  var testExp= /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/;  // 检查html标签
  var rejectExp = /^<(\w+)\s*\/?>/;  //"<(div)>"
  var spaceExp = /\s+/;   // 1个或多个空格
  var rootjQuery;
  var optionsCache = {};
  // jQuery构造函数
  var jQuery = function(selector, context) {
    return new jQuery.prototype.init(selector, context, rootjQuery);
  }
  jQuery.fn = jQuery.prototype = {
    length: 0,  // 定义的很骚气，jQuery.merge会用到判断
    init: function(selector, context, rootjQuery) {
      var match;
      if(!selector) { // $(), $(undefined), $(null) , $(false)
        return this;
      }
      if(typeof selector === "string") { // 字符串
        if(selector.charAt(0) === "<" && selector.charAt(selector.length -1) && selector.length >=3) { // < 开头  > 结尾  长度>=3 如：<a>
          match = [null, selector, null];  // 构造这种结构和正则规则捕获一致 $("<div>") 正则表达式数组第二个值match[1]不会有值
        } else {
          match = testExp.exec(selector);   // 通过正则去匹配到标签 $("#box")
        }
        if(match[1]) {  // 创建DOM  $("<div>")
          jQuery.merge(this, jQuery.parseHTML(selector, context && context.nodeType ? context : document));
        } else {  // 查询DOM  $("#box")
          elem = document.getElementById(match[2]);
          if(elem && elem.nodeType) {
            this.length = 1;
            this[0] = elem;
          }
          // 组装jquery对象
          this.context = document;
          this.selector = selector;
        }
      } else if(selector.nodeType) { // $(this), $(document), $(window)
        this.context = this[0] = selector;
        this.length = 1;
        return this;
      } else if(jQuery.isFunction(selector)) { // 文档加载完毕后执行函数
        rootjQuery.ready(selector);
      }
    },
    css: function(name, value) {
      return jQuery.access( this, function(elem, name, value) {
        if(value === undefined) {  // get
          return jQuery.curCSS( elem, name);
        }
        jQuery.style(elem, name, value);   // 重置样式
      }, name, value);
    },
    text: function(value) {
      return jQuery.access(this, function(elem, value) {
        // value === undefined ? get : set
        return value === undefined ? jQuery.text( elem ) : jQuery.empty( elem, value)
      }, value)
    },
    ready: function(fn) {
      document.addEventListener("DOMContentLoaded", jQuery.ready);  // 监听页面是否加载完成
      if(jQuery.isReady) { // 页面加载完成在jQuery.ready中变为true，加这一步是事件监听函数已经不会再执行了
        fn.call(document, jQuery);  
      } else {
        jQuery.readyList.push(fn);  // 搜集所有执行函数
      }
    }
  }
  jQuery.extend = jQuery.fn.extend = function() {
    var deep = false;  // 默认浅拷贝
    var length = arguments.length;
    var target = arguments[0] || {};
    var i = 1, option, name, src, copy, copyIsArray;
    if(typeof target === "boolean") {  // 深拷贝
      deep = target;
      target = arguments[i] || {}; // 深拷贝把所有的合并对象放到第2个参数
      i = 2;
    }
    if(typeof target !== "object") {  // 第一个参数必须是对象
      target = {};
    }
    if(length === i) {  // 如果只有一个参数，(1) $.fn.extend就是加入到jquery实例上 (2) $.extend加入到jQuery本身
      target = this;  // 这步很精髓，谁调用给谁加属性
      i--;
    }
    for (; i < length; i++) {  // 如果参数大于1，target就存了第一个参数，且循环从1(第二个参数)开始，只要轮询赋值就可以了
      if((option = arguments[i]) !==null) {
        for (const name in option) {
          src = target[name];
          copy = option[name];
          if(deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) { // 深拷贝，拷贝的有可能是深层对象和数组
            if(copyIsArray) {  // 拷贝的是数组
              copyIsArray = false;
              clone = src && jQuery.isArray(src) ? src : [];  // 保证数组跟数组合并
            } else {  // 拷贝的是对象
              clone = src && jQuery.isPlainObject(src) ? src : {};  // 保证对象和对象合并
            }
            target[name] = jQuery.extend(deep, clone, copy);
          } else if(copy !== undefined) {
            target[name] = copy;
          }
        }
      }
    }
    return target;
  }
  // 工具函数
  jQuery.extend({
    Deferred: function() {  // 异步回调解决方案
      var state = "pedding"
      var promise = {
        state: function() {
          return state;
        },
        promise: function( obj ) {
          return typeof obj === "object" ? jQuery.extend(obj, promise) : promise;
        }
      }
      // 数据源集合
      var tuples = [
        ["resolve", "done", jQuery.Callbacks("once memory"), "resolved"],
        ["reject", "fail", jQuery.Callbacks("once memory"), "rejected"],
        ["notify", "progress", jQuery.Callbacks("once memory")]
      ]

      var deferred = {};  // 保存deferred对象
      jQuery.each( tuples, function(i, tuple) {
        var list = tuple[2];   // list回调列表 {add: ƒ, fire: ƒ, fireWith: ƒ}
        deferred[ tuple[0] ] = list.fire;  // def.resolve()相当于调用fire方法
        deferred[ tuple[0] + "with" ] = list.fireWith;
        promise[ tuple[1] ] = list.add;  // 给when中使用,所以需要把promise merge到deferred中
        var stateString = tuple[3];
        if(stateString) {  // 更新下state值，notify走的是默认pedding
          list.add(function() {
            state = stateString
          })
        }
      });
      // console.log(deferred);   // {resolve: ƒ, resolvewith: ƒ, reject: ƒ, rejectwith: ƒ, notify: ƒ, …}
      promise.promise( deferred );
      console.log(deferred)
      return deferred;
    },
    when: function(async) {
      return async.promise();
    },
    Callbacks: function(options) {
      options = typeof options === "string" ? ( optionsCache[options] || createOptions(options)) : {};  // options保存options.split后的对象 {mermory: true, stopOnFalse: true}
      var memory, start, index, firing, length, testing;
      var list = [];  // 回调列表
      // 执行回调列表
      var fire = function( data ) {
        memory = options.memory && data;  // 获取参数值
        index = start || 0;   // 第一次进来直接从0开始执行回调列表，后面进来index从上一次执行完length（list.length）开始
        length = list.length;  // 记录上次执行的length
        firing = true;
        testing = true;  // 如果参数有once 回调函数已经调用过了
        for( ; index < length; index++) {
          if(list[index].apply( data[0], data[1]) === false && options.stopOnFalse ) {  // 判断执行结果是否为false，给stopOnFalse使用
            break;
          }
        }
        start = 0;  // 执行完成重置start, 处理参数不传的情况，memory直接执行fire函数
        firing = false;
      }
      // 工厂模式
      var self = {
        add: function() {
          var startlen = list.length;
          jQuery.each( arguments, function(i, value) {
            if(jQuery.isFunction(value)) {
              list.push(value);
            }
          })
          if(firing) {  // 执行完回调才能去获取回调函数的长度作为新起始点
            start = list.length;
          } else 
          if(memory) {
            start = startlen;  // add之前的回调列表函数
            fire(memory);    // 如果是memory，fire之后的add立即执行
          }
          return this;
        },
        fireWith: function(context, args) {
          args = [ context, args ];
          if(!options.once || !testing) {  // 没有once || 是once，但是第一次调用
            fire( args );
          }
        },
        fire: function() {
          self.fireWith( this, arguments);
          return this;
        }
      }
      return self;
    },
    // 获取text值
    text: function(elem) {
      var nodeType = elem.nodeType;
      if(nodeType === 1 || nodeType === 9 || nodeType === 11) { // 1 Element元素  9 Document  11 DocumentFragment
        return elem.textContent;
      }
    },
    // 设置 text的值
    empty: function(elem, value) {
      var nodeType = elem.nodeType;
      if( nodeType === 1) {  // 1 Element
        elem.textContent = value;
      }
    },
    curCSS: function(elem, name) {
      var CSSStyleDeclaration, result;
      if( getComputedStyle ) { // 返回css样式值的api
        CSSStyleDeclaration = document.defaultView.getComputedStyle(elem, null);
        result = CSSStyleDeclaration.getPropertyValue( name );
      }
      return result;
    },
    style: function(elem, key, value) {
      if(value !== undefined) {
        elem.style[key] = value;
      }
    },
    access: function(elems, fn, key, value) {  // $.css第一个参数
      var length = elems.length;
      var name;
      var deep = true; // set场景不要return
      // 先判断是set/get
      if(typeof key === "object") { // 场景一set  $.css({"background": "red"})
        deep = false;
        for(name in key) {
          jQuery.access(elems, fn, name, key[name]);  // 通过场景二set
        }
      }
      if( value !== undefined) { // 场景二set  $.css("background": "red")
        deep = false;
        for (var i = 0; i < length; i++) {
          fn(elems[i], key, value);      // 通过回调去set
        }
      }
      // get
      return (length && deep) ? fn(elems[0], key) : undefined;  // set不return
    },
    readyList: [],
    ready: function() {
      jQuery.isReady = true;
      jQuery.each(jQuery.readyList, function(i, fn) {
        this.call(document);  // 执行每个函数
      });
      jQuery.readyList = null;
    },
    each: function(obj, callback, args) {
      var length = obj.length;
      var name, i=0;
      if(args) {  // $.each有第三个参数
        if(length === undefined) {  // obj是对象
          for (name in obj) {
            callback.apply(obj, args)
          }
        } else {
          for (; i < obj.length;) {
            callback.apply( obj[i++], args);
          }
        }
      } else {
        if(length === undefined) {
          for (name in object) {
            callback.call(obj, name, obj[name]);
          }
        } else {
          for(; i< length; ) {
            callback.call( obj[i], i, obj[i++]);
          }
        }
      }
    },
    parseHTML: function(data, context) {
      if( !data || typeof data !== "string") {
        return null;
      }
      var parse = rejectExp.exec(data);  // 过滤掉<div>  => div
      return [context.createElement(parse[1])];
    },
    isArray: function(obj) {
      return toString.call(obj) === "[object Array]";
    },
    isPlainObject: function(obj) {
      return toString.call(obj) === "[object Object]";
    },
    isFunction: function(obj) {
      return toString.call(obj) === "[object Function]";
    },
    // 静态方法   类数组=>数组
    makeArray: function(arr) {
      var result = [];
      if(arr || arr.length >=1) {
        // 合并数组
        return jQuery.merge(result, arr);
      }
    },
    merge: function(arg1, arg2) {
     var i = arg1.length;     // jquery的原型定义了length=0，骚气
     var l = arg2.length;
     var j= 0;
     if(typeof l === "number") { // args2是数组
       for (; j < l; j++) {
          arg1[i++] = arg2[j];         
       }
     } else {
       while (arg2[j] !== undefined) { // {0: "alan1", 1: "alan2"} // 支持这种类型
         arg1[i++] = arg2[j++]
       }
     }
    //  arg2.length = i;  // 修正length
     return arg1;
    }
  });

  function createOptions(options) {
    var obj = optionsCache[options] = {};
    jQuery.each(options.split(spaceExp), function(i, value) {
      obj[value] = true;
    });
    return obj;
  }

  jQuery.fn.init.prototype = jQuery.fn;
  rootjQuery = jQuery(document);
  root.$ = root.jQuery = jQuery;
})(this)