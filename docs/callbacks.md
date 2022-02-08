##  $.Callbacks

### 用法
```js
//   var callback = $.Callbacks("memory");
//   var callback = $.Callbacks("stopOnFalse");
var callback = $.Callbacks("once memory");
console.log(callback)
  //工厂函数   创建了一个回调列表
callback.fire();
callback.add(function(){
    console.log(1)
    //  return false; 
});

callback.add(function(){
    console.log(2)
});

callback.fire(); 

callback.add(function(){
    console.log(3)
});

callback.fire(); 
```

### $.Callbacks实现
```js
jQuery.extend({
    isFunction: function( seletor ){
        return typeof seletor === "function";
    },
    Callbacks: function( options ){   // "once memory"
        options = typeof options === "string" ? ( optionsCache[options] || createOptions(options) ) : {};
        //index 起始点  start 终点 firing 回调列表中的转态 testing回调列表有没有调用
        var memory,index,start,firing,length,testing;
        var list = [];    //回调列表

        //控制callback的调用
        var fire = function( data ){
            memory = options.memory && data;   // data
            firing = true;
            testing = true;
            index = start || 0;    //index  正在调用callback的索引值   2
            start = 0;      //起始点
            length =list.length;     //3
            for( ; index<length ; index++ ){
            //调用callback
                if(list[index].apply( data[0], data[1] ) === false && options.stopOnFalse ){
                    break;
                }
            }
            firing = false;
        }
        //工厂模式
        var self = {
        add: function(){
            var startlen = list.length;   // 2
            jQuery.each( arguments, function( i, value ){
                if( jQuery.isFunction(value) ){
                    list.push(value);
                }
            }); 
        

            if( firing ){
            start = list.length;
            } else if( memory ){   // yes
            start = startlen;   //2
            fire(memory);   //data
            }

            return this;
        },
        
        ///给list回调列表中的callback 指定上下文对象 
        fireWith: function( context, args ){
            args = [ context, args ];
            if( !options.once || !testing ){    //true   !true
                fire( args );     //
            }
                

        },
        //给list回调列表中的callback 指定参数
        fire: function(){
            self.fireWith( this, arguments);
            return this;
        },
        }

        return self;
    }
})
  function createOptions(options){
     var object = optionsCache[options] = {};  //"once memory"  ["once" "memory"]
     jQuery.each(options.split(spaceExp), function( i, value ){
         object[value] = true;   //value  === stopOnFale
     });
      return object;
   }
```


























