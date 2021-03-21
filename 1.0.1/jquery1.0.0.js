(function(root) {
  var testExp = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/;  // 匹配标签
  var rejectExp = /^<(\w+)\s*\/?>/;
  var spaceExp = /\s+/;
  var optionsCache = {};
  var jQuery = function(selector, context) {
    return new jQuery.prototype.init(selector, context, rootJquery);
  }

  jQuery.fn = jQuery.prototype = {
    length: 0,
    init: function(selector, context, rootJquery) {
      var match, elem;
      if( !selector ) {
        return this;
      }
      // 字符串
      if(typeof selector === 'string') {
        // html字符串 $("<div>") 
        if(selector.charAt(0) === "<" && selector.charAt(selector.length -1) === ">" && selector.length >=3) {
          match = [null, selector, null];
        } else {
          match = testExp.exec(selector);
        }
        // 创建dom  $("<div>").append(document)
        if(match[1]) {
          return jQuery.merge(this, jQuery.parseHTML(selector, context && context.nodeType ? context : document));
        } else {  // 查询dom
         elem = document.getElementById(match[2]);
         if(elem && elem.nodeType) {
           this.length = 1;
           this[0] = elem;
         }
         this.context = document;
         this.selector = selector;
         return this;
        }
      } else if( selector.nodeType ) { // 对象 || 函数
        this.context = this[0]  = selector;
        this.length = 1;
        return this;
      } else if(jQuery.isFunction(selector)) { // 事件监听  DOMContentLoaded
        rootJquery.ready(selector);
      }
    },
    text: function(value) {
      return jQuery.access(this, function(elem, value) {
        // value === undefined ? get: set
        return value === undefined ? jQuery.text(elem) : jQuery.empty(elem, value);
      }, value );
    },
    css: function(name, value) {
      // 根据参数判断用户行为
      /**
       * this jquery实例
       * name 属性
       * value 值
       * callback 根据判断结果来进行具体的执行
       */
      return jQuery.access(this, function(elem, key, value) {
        if(value === undefined) {
          // get
          return jQuery.curCSS(elem, key);
        }
        // 重置element样式
        return jQuery.style(elem, key, value)
      }, name, value);
      
    },
    ready: function(fn) {
      // 监听dom是否加载完毕
      document.addEventListener('DOMContentLoaded', jQuery.ready);
      if(jQuery.isReady) {
        fn.call(document, jQuery);
      } else {
        jQuery.readyList.push(fn);
      }
    }
  }

  jQuery.fn.init.prototype = jQuery.fn

  jQuery.extend = jQuery.prototype.extend = function() {
    var target = arguments[0] || {};
    var length = arguments.length;
    var i = 1, name, options, src, copy, copyIsArray, clone
    deep = false;
    // 第一个参数是boolean值，target重新赋值
    if(typeof target === 'boolean') {
      deep = target;
      target = arguments[1];
      i = 2;
    }
    // 不是对象，给个默认值
    if(typeof target !== "object") {
      target = {};
    }
    if(length === i) {
      target = this;
      i--;
    }
    //把obj2塞到obj1
    for (; i < length; i++) {
      if( (options = arguments[i]) !== null) {
        for (name in options) {
          src = target[name];
          copy = options[name];
          if(deep && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
            // 深拷贝
            if(copyIsArray) {
              copyIsArray = false;
              clone = src && jQuery.isArray(src) ? src : [];
              // 属性是数组
            } else {
              // 属性对象
              clone = src && jQuery.isPlainObject(src) ? src : {};
            }
            target[name]  = jQuery.extend(deep, clone, copy);
          } else if(copy !== undefined) {
            // 浅拷贝
            target[name] = copy;
          }
        }
      }
    }
    return target;
  }

  jQuery.extend({
    isReady: false,
    readyList: [],
    Deferred: function() {
      var state = "peding"; // 默认状态
      var promise = {
        state: function() {
          return state;
        },
        promise: function(obj) {
          return typeof obj === "object" ? jQuery.extend( obj, promise ): promise ;
        }
      }
      // 数据源集合
      var tuples = [
        ["resolve", "done", jQuery.Callbacks("once memory"), "resolved"],
        ["reject", "fail", jQuery.Callbacks("once memory"), "rejected"],
        ["notify", "progress", jQuery.Callbacks("once memory")]
      ];

      var deferred = {};

      jQuery.each(tuples, function(i, tuple) {
        var list = tuple[2];
        deferred[ tuple[0] ] = list.fire;  // 调用回调列表函数
        deferred[ tuple[0] + 'With' ]  = list.fireWith;

        promise[ tuple[1] ] = list.add;

        var stateString = tuple[3];

        if( stateString ) {
          list.add(function() {
            state = stateString;
          });
        }
      });
      promise.promise( deferred );
      return deferred;

    },
    when: function( async ) {
      return async.promise();
    },
    Callbacks: function(options) {
      options = typeof options === 'string' ? (optionsCache[options] || createOptions(options)) : {};
      var memory, index, firing, start;
      var list = [];

      // 
      var fire = function( data ) {
        memory = options.memory && data;  // memory是否定义
        firing = true;  // 回调函数是否执行完
        index =  start || 0;
        start = list.length, firing;
        // 执行回调函数
        for (; index < start; index++) {
          // 如果是stopOnFalse只执行一次
          if(list[index].apply( data[0], data[1] ) === false &&options.stopOnFalse) {
            break;
          }
        }
        firing = false; // 已执行完毕
      }

      // 工厂模式
      var self = {
        add: function() {
          var startlen = list.length;
          // 收集回调函数
          jQuery.each(arguments, function(i, value) {
            if(jQuery.isFunction(value)) {
              // 把所有的回调函数push到list
              list.push(value);
            }
          });
          if(firing) {
            // 这里好像永远都不会执行
            start = list.length;  // 为了记录fire()执行后的length
          } else if(memory) {
            start = startlen; // 记录fire执行之前的length
            fire(memory);  // fire执行过后手动调用fire执行
          }
          return this;
        },
        fireWith: function(context, args) {
          args = [ context, args ];
          fire(args);
        },
        fire: function() {
          self.fireWith( this, arguments);
          return this;
        }
      }
      return self;
    },
    text: function(elem) {
      // nodeType 1 元素  9 整个文档  11 document对象
      if(elem.nodeType === 1 || elem.nodeType === 9 || elem.nodeType === 11) {
        return elem.textContent;
      }
    },
    empty: function(elem, value) {
      var nodeType = elem.nodeType;
      if(nodeType === 1) {
        elem.textContent = value;
      }
      return elem;
    },
    style: function(elem, name, value) {
      if( value !== undefined) {
        elem.style[name] = value;
      }
      return elem;
    },
    curCSS: function(elem, name) {
      var CSSStyleDeclaration, result;
      CSSStyleDeclaration = document.defaultView.getComputedStyle(elem, null);
      result = CSSStyleDeclaration.getPropertyValue(name);
      return result;
    },
    access: function(elems, fn, key, value) {
      var length = elems.length;
      var name, deep = true;
      // 判断用户行为 get,set
      // set 1
      if(key === 'object') {
        deep = false;
        for (name in key) {
          jQuery.access(elems, fn, name, key[name] );
        }
      }
      // set 2
      if( value !== undefined) {
        deep = false;
        for (let i = 0; i < length; i++) {
          fn(elems[i], key, value)
        }
      }
      if( length && deep ) {
        return fn(elems[0], key)
      } else {
        return undefined;
      }
      // return length ? fn( elems[0], key) : undefined;
    },
    ready: function() {
      jQuery.isReady = true;
      jQuery.each(jQuery.readyList, function(index, fn) {
        // 改变this指向
        this.call(document);
      });
      jQuery.readyList = null;
    },
    // 循环对象
    /**
     * object 目标源
     * callback 回调函数
     * args 自定义回调函数参数
     */
    each: function(object, callback, args) {
      var length = object.length;
      var name, i = 0;
      // 自定义callback参数
      if( args ) {
        // object 是对象
        if( length === undefined ) {
          for (name in object) {
           callback.apply(object, args);
          }
        } else {
          for (; i < length; i++) {
            callback.apply(object, args);
          }
        }
      } else {
        // 无自定义参数，object 是对象
        if( length === undefined ) {
          for (name in object) {
           callback.call(object, name, object[name]);
          }
        } else {
          for (; i < length;) {
            callback.call(object[i], i, object[i++]);  // this最好指向当前对象
          }
        }
      }
    },
    parseHTML: function(data, context) {
      if(!data || typeof data !== 'string') {
        return null;
      }
      // 过滤<div>
      var parse = rejectExp.exec(data);
      return [context.createElement(parse[1])];
    },
    // 是否为函数
    isFunction: function(obj) {
      return toString.call(obj) === '[object Function]';
    },
    // 是否为对象
    isPlainObject: function(obj) {
      return toString.call(obj) === '[object Object]'
    },
    // 是否为数组
    isArray: function(obj) {
      return toString.call(obj) === '[object Array]'
    },
    markArray: function(arr) {
      var result = [];
      if(arr && arr.length) {
        return jQuery.merge(result, arr);
      }
      return result;
    },
    merge: function(arg1, arg2) {
      var i = arg1.length;
      var l = arg2.length;
      var j =0, name ;
      if(typeof l === 'number') {
        for (;j < l; j++) {
          arg1[i++] = arg2[j];
        }
      } else {
        while (arg2[j] !== undefined) {
          arg1[i++] = arg2[j++];
        }
      }
      return arg1; 
    }
  });

  jQuery.prototype.init.prototype = jQuery.prototype;

  function createOptions(options) {
    var object = optionsCache[options] = {}; // 初始化
    jQuery.each(options.split(spaceExp), function(i, value) {
      object[value]  = true;
    });
    // optionsCache[options] = object;
    return object;
  }

  var rootJquery = jQuery(document);
  root.$ = root.jQuery = jQuery;
})(this)