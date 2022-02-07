## jQuery初始化

#### jQuery函数对象和jQuery实例的用法

```html
----------------------index.html-----------------------
<div id="hello1">hello1</div>
<div id="hello2">hello2</div>
<script>
    $("div").each(function(item, index){
        console.log("$().each: ", item, index);
    });
    var obj = {
        name: "alan",
        habbit: "football"
    }
    $.each(obj, function(item, index){
        console.log("$.each: ", item, index)
    });
</script>
```
> 结论：函数对象和实例对象都挂载了each方法，extend支持在函数对象和实例对象上扩展属性和方法，后续章节有对jquery的实现方式讲解

### jQuery源码实现

```js
-----------------------jQuery.js---------------------------------
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

    root.jQuery = root.$ = jQuery;  // jQuery和$挂载到了全局变量上
})( this )
```

> 结论： jQuery构造函数中返回的是init匿名函数的实例，再把init匿名函数的原型指向jQuery构造函数的原型，这样jQuery既支持函数对象也支持实例对象调用