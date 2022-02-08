##  $.Deferred

### deferred和XHR对象
```js
  //同步任务列队  从上往下加载     异步任务列队
//1.5xxx   XHR对象
$.ajax({
    url:"test.json",
    type:"get",
    dataType:"json",
    success: function(data){  //html  text/pain
    console.log(data)
    console.log("成功")
    },
    error: function(){
        console.log("失败")
    }
});

 // 1.7 deferred对象
$.when($.ajax({url:"test.json",type:"get",dataType:"json",}),
        $.ajax({url:"test1.json",type:"get",dataType:"json",}))
.done(function(data){   //集合
    console.log("成功");
    })
.fail(function(){
    console.log("失败");
    })
.done(function(){
    console.log("我还可以调用哦");
    });

```

### 用法
```js
 var der = $.Deferred();   //deferred对象
  var wait = function(der){
    var test = function(){
      // 这个才是重中之重，能找到对应的执行函数
      der.reject();   //成功  失败    fire   ==  list
    }
    setTimeout(test,3000);
    return der;
  }
  //异步操作  普通函数
  $.when(wait(der))
  .done(function(){
    console.log("执行成功");
  })
  .fail(function(){
    console.log("执行失败");
  })
  .done(function(){
    console.log("再次执行成功");
  });
```

总结：
1. deferred  异步编程  "回调" 解决方案
2. 一个异步的操作 成功 失败   对应一个回调函数 
   
3. 多个异步的操作 成功 失败   对应一个回调函数
4. 一个异步的操作 成功 失败   对应多个回调函数 
  
```js
/*
    异步操作  设置了状态
    resolve  成功     ==  done    回调
    reject   失败     ==  fail    回调
    notify   进行中   ==  progess 回调
*/
 ```
 
### $.Deferred实现
```js
jQuery.extend({
  Deferred: function(){
   var state = "peding";
   //核心
   var promise = {
     //状态信息
     state: function(){
        return state;
     },
     promise:function( obj ){
       return  typeof obj === "object" ? jQuery.extend( obj, promise ): promise ;
     }
   }
   //数据源的集合
   var tuples =[
       ["resolve" , "done", jQuery.Callbacks("once memory"), "resolved"],
       ["reject" , "fail", jQuery.Callbacks("once memory"), "rejected"],
       ["notify" , "progess" , jQuery.Callbacks("once memory")]
   ];

   var deferred = {};

   jQuery.each( tuples, function( i, tuple ){
       var list = tuple[2];   //list 回调列表   3
       //promise.resolve || reject || notify   fire() 回调列表  调用回调列表中的callback
       deferred[ tuple[0] ] = list.fire;
       //promise.resolveWith || rejectWith || notifyWith
       deferred[ tuple[0]+"With" ] = list.fireWith;
       //promise.done || fail || progess   回调列表  add  添加一条callback
       promise[ tuple[1] ] = list.add;
       var stateString = tuple[3];

       if( stateString ){
          list.add(function(){
             state = stateString;
          });
       }
   });
   promise.promise( deferred );
   console.log(deferred)
   return deferred;
  },
   
  when: function( async ){   //多个?
     return async.promise();
  }
});
```





























