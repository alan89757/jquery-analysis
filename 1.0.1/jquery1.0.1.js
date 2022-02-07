(function(root) {

  var testExp= /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/; // 匹配html标签
  var rejectExp = /^<(\w+)\s*\/?>/;  // 匹配选择器

  var rootjQuery; // 存储jQuery(document) 对象

  var spaceExp = /\s+/;  // 切割callbacks配置项
  var optionsCache = {}; // 存储callbacks配置项

  var jQuery = function( selector, context) {
    return new jQuery.prototype.init(selector, context, rootjQuery);
  }

  jQuery.fn = jQuery.prototype = {
    length: 0,   // 解决merge静态方法的this的length==undefined的问题
    init: function(selector, context, rootjQuery) {
      var match, elem;
      if( !selector ) {
        return this;
      }
      if( typeof selector === "string") {
        // 字符串有两种可能 
        // 1.查询字符串 #box, .box, html字符出
        // 2.创建DOM
        if(selector.charAt(0) === "<" && selector.charAt(selector.length -1 ) && selector.length >=3) { // 匹配是一个正确的标签
          match = [null, selector, null ]; // 为什么要用match，是为了构造一种结构， 通过match[1]去判断
        } else {
          match = testExp.exec(selector); // 跟上面的match是同一种结构
        }
        // 判断是创建还是查询
        if( match[1] ) {
          // 创建dom
          // context上下文存在传context，否则默认document
          // 把返回值添加到对象
          jQuery.merge(this, jQuery.parseHTML(selector, context && context.nodeType ? context : document));
        } else {
          // 查询dom, 用第二个子查询匹配的值去查询dom,通过id去查询dom， 相对于jquery源码是简化的
          elem = document.getElementById(match[2]);
          if( elem && elem.nodeType ) {
            this.length = 1;
            this[0] = elem;
          }
          this.context = document;
          this.selector = selector;
          return this;
        }

      } else if(selector.nodeType) {  // $(document)
        // document 构造一个同样的对象
        this.context = this[0] = selector;
        this.length = 1;
        return this;
      } else if( jQuery.isFunction(selector)) {
        // dom加载完成
        rootjQuery.ready(selector);
      }
    },
    css: function(name, value) {
      // 根据参数判断
      /**
       * this 当前对象
       * name 键名称
       * value 键值
       * fn 回调
       */
      return jQuery.access(this, function(elem, name, value) {
        if(value === undefined) { // get
          return jQuery.curCss(elem, name);
        } else {  // set
          // 重置element某个css样式属性的值
          jQuery.style(elem, name, value);
        }
      }, name, value);
    },
    text: function(value) {
      return jQuery.access(this, function(elem, val) {
        if(val === undefined) { // get
          return jQuery.text( elem );
        } else { // set
          return jQuery.empty( elem, value );
        }
      }, value);
    },
    ready: function(fn) {
      document.addEventListener("DOMContentLoaded", jQuery.ready);
      if(jQuery.isReady) {
        // 这里貌似不会进来
        fn.call( document, jQuery );
      } else {
        jQuery.readyList.push(fn);
      }
    }
  }

  jQuery.fn.init.prototype = jQuery.fn;

  // 工具函数
  jQuery.extend = jQuery.prototype.extend = function() {
    var target = arguments[0] || {};
    var length = arguments.length;
    var i = 1, options, src, copy,copyIsArray, clone, deep;

    if(typeof target === "boolean") {  //$.extend(true, {}, {})
      // 第一个参数是布尔值，说明是深/浅拷贝，target要重新赋值
      deep = target;
      target = arguments[1];
      i = 2; // 为了合并时options下标值从2开始 (true, {a: 1}, {b: 2})
    }

    if( typeof target !== "object") {
        target = {};
    }

    // 一个参数，实例扩展，给jquery扩展静态方法
    if(length == i) {
      target = this;
      i--;
    }

    for (;  i < length; i++ ) {
      // 深拷贝 source从2开始
      if((options = arguments[i]) !== null) {
        for (name in options) {
          src = target[name];  // 目标源，后面需要判断是否是数组
          copy = options[name];  // 要合并的值
          // 深拷贝 只需要处理对象和数组
          if(deep && ((copyIsArray = jQuery.isArray(copy)) || jQuery.isPlainObject(copy))) { // 深拷贝中区分是否是数组
            if(copyIsArray) {
                copyIsArray = false;
                clone = jQuery.isArray(src) ? src : [];
            } else {
                clone = jQuery.isPlainObject(src) ? src : {};
            }
            // 属性值是对象或数组还需要再合并一次
            target[name] = jQuery.extend(deep, clone, copy)
          } else if(copy !== undefined) {
            target[name] = copy;
          }
        }
      }
    }
    return target;
  }

  jQuery.extend({
    Deferred: function() {
      var state = "peding";
      var promise = {
        state: function() {
          return state;
        },
        promise: function(obj) {
          return typeof obj === "object" ? jQuery.extend(obj, promise): promise;
        }
      }
      // 数据源集合
      var tuples = [
        ["resolve", "done", jQuery.Callbacks("once memory"), "resolved"],
        ["reject", "fail", jQuery.Callbacks("once memory"), "rejected"],
        ["notify", "progress", jQuery.Callbacks("once memory")]
      ]
      var deferred = {};
      // 循环创建各自的函数绑定
      jQuery.each(tuples, function(i, tuple) {
        var list = tuple[2];  // jQuery.Callbacks返回的this对象
        deferred[tuple[0]] = list.fire;
        // deferred[ tuple[0] + "With"] = list.fireWith; // 并不知道有什么用,可能后面会用到
        // deferred[tuple[1]] = list.add;
        promise[tuple[1]] = list.add;  // done/fail/progress都指向了Callbacks返回的add函数 $.when().done(fn), 为了把回调添加进去
        var stateString = tuple[3];
        // 这个判断也不知道用来干嘛
        if(stateString) {
          // 更新state状态
          list.add(function(){
            state = stateString;
         });
        }
      });
      promise.promise( deferred ); // 把promise的回调和deferred合并 {resolve: ƒ, reject: ƒ, notify: ƒ, state: ƒ, promise: ƒ}
      return deferred;
    },
    when: function(async) {
      // promise 和deferred对象合并
      console.log(async.promise())
      return async.promise();
    },
    Callbacks: function(options) {
      // firing 用来判断是否正在执行回调，目前没用到，但是回调比较多可能会有耗时较长，这个字段还是有必要的。也为了防止add新添加的fn，跑到前面执行
      // testing 当options="once memory"
      var list = [], memory,firing,testing;
      options = typeof options === "string" ? (optionsCache[options] || createOptions(options)) : {};  // 不存在直接创建
      var index; // fire执行的索引值
      var start;  // 执行list最后执行函数下标值
      // data = [this, arguments]  // 给函数apply回调执行
      var fire = function(data) {
        memory = options.memory && data;
        var length = list.length;
        firing = true;  // 正在执行的情况下，更新list.length,能直接执行add的回调函数
        testing = true; // 直接执行fire判断是否已执行过
        index = start || 0; // 执行fire之后添加的fn
        start = 0;  // fire执行后重置为0，因为add有赋值，所以需要重置下

        // 通过改变index的值，获得需要执行的函数
        for (; index < length; index++) {
          if(list[index].apply(data[0], data[1]) === false && options.stopOnFalse) {
            break;
          }
        }
        firing = true;
      }

      var self = {
        add: function() {
          var startlen = list.length; // 拿到fire之前的length,主要是为了更新start，起始index
          jQuery.each(arguments, function(i, value) {
            if(jQuery.isFunction(value)) {
              list.push(value);
            }
          });
          
          if(firing) {
            // 回调列表正在执行中
            start = list.length;
          } else if(memory) { // 如果是memory，fire之后add新增后的参数继续执行
            start = startlen;  // 立即执行add添加的回调函数
            fire(memory);
          }
          return this;
        },
        fireWith: function(context, args) {
          args = [ context, args ];  // 构造[this, arguments]
          if(!testing)
          fire(args);
        },
        fire: function() {
          self.fireWith(this, arguments);
          return this;
        }
      }
      return self;
    },
    empty: function(elem, value) {
      if(elem.nodeType === 1) {
        elem.textContent = value;
      }
    },
    text: function(elem) {
      if(elem.nodeType ===1 || elem.nodeType === 9 || elem.nodeType ===1) {
        return elem.textContent;
      }
    },
    style: function(elem, name, value) {
      if( value !== undefined ) {
        elem.style[name] = value;
      }
    },
    curCss: function(elem, name) {
      var CSSStyleDeclaration, result;
      // 通过getComputedStyle,getPropertyValue获取属性值
      if(getComputedStyle) {
        CSSStyleDeclaration = document.defaultView.getComputedStyle(elem, null);
        result = CSSStyleDeclaration.getPropertyValue(name)
      }
      return result;
    },
    access: function(elems, fn, key, value ) {
      var length = elems.length;
      var name, deep = true;
      // 通过value值判断操作是get/set
      // 两种set可能  1.key === 'object' 2.value !==undefined
      // key是object, set 1
      if(jQuery.isPlainObject(key)) {
        deep = false;
        for (name in key) {
          jQuery.access(elems, fn, name, key[name])
        }
      }
      // value !== undefined set 2
      if(value !== undefined) {
        deep = false;
        for (var i = 0; i < length; i++) {
          fn(elems[i], key, value);
        }
      }
      // get
      if(length && deep) {
        return fn(elems[0], key);
      } else {
        return undefined;
      }
    },
    isReady: false,   // 记录是否加载完成
    readyList: [],    // 存储回调列表
    ready: function() {
      jQuery.isReady = true;
      jQuery.each(jQuery.readyList, function(i, fn) {
        // this指向fn
        this.call(document);
      });
      jQuery.readyList = null;
    },
    each: function(object, callback, args) {
      var length = object.length;  // 判断是数组还是对象
      var name, i = 0;
      // 通过args判断,给回调函数的参数
      if(args) {
        if( length === undefined) {
          for (name in object) {
            callback.apply(object, args)
          }
        } else {
          for (; i < length;) {
            callback.apply(object[i++], args)
          }
        }
      } else {
        if( length === undefined) {
          for (name in object) {
            callback.call(object, name, object[name])
          }
        } else {
          for (; i < length; i++) {
            callback.call(object[i], i, object[i])
          }
        }
      }
    },
    parseHTML: function(data, context) {
      if( !data || typeof data !== "string") {
        return null;
      }
      var parse = rejectExp.exec(data);
      return [context.createElement(parse[1])];
    },
    isFunction: function(obj) {
      return toString.call(obj) === "[object Function]"
    },
    isPlainObject: function(obj) {
      return toString.call(obj) === "[object Object]";
    },
    isArray: function(obj) {
      return toString.call(obj) === "[object Array]";
    },
    markArray: function(arr) {
      var result = [];
      if(arr && arr.length) {
       return jQuery.merge(result, arr);
      }
      // return null;
    },
    merge: function(arg1, arg2) {
      var i = arg1.length;
      var l = arg2.length, j = 0;
      if( typeof l === "number") {
        for (; j < l; j++) {
          arg1[i++] = arg2[j];
        }
      } else {  // {"0":"max","1":"star","2":"Ariel"}
        while(arg2[j] !== undefined) {
          arg1[i++] = arg2[j++];
        }
      }
      return arg1;
    }
  })

  function createOptions( options ) {
    var object = optionsCache[options] = {}; // 引用类型
    jQuery.each(options.split(spaceExp), function(i, value) {
      object[value] = true;
    });
    return object;
  }

  rootjQuery = jQuery(document);
  root.jQuery = root.$ = jQuery;

})(this);