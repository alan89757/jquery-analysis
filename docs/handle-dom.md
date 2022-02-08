##  $.css和$.text

### $.css用法

```js
  console.log($('#box').css('font-size'));
  $('#box').css('color', 'red');
  $('#box').css({backgroundColor: 'red', width: '100px', height: '100px'})
```

### $.css实现
```js
jQuery.fn = jQuery.prototype = { 
    css: function( name, value ){
       //根据参数来判断用户的行为
       /*
        this  jQuery实例对象
        name   属性
        value  属性的值
        callback   根据判断的结果来进行具体的执行
        */
       return jQuery.access( this, function( elem, name, value ){

              if( value === undefined ){
                  //get 返回Elment某个css样式属性的值
                return jQuery.curCSS( elem, name );
              }
             // 重置Elment某个css样式属性的值
             jQuery.style( elem, name, value );
       }, name, value );
     },
}

jQuery.extend({
    access: function( elems, fn, key, value){   //this   value   fn  undefined
     var length = elems.length;
     var name;
     //判断用户是要get  set
     //set  1
      if( typeof key === "object" ) {
         //递归
         for( name in key ) {
            jQuery.access( elems, name, key[name], fn );
         }

         return elems;
      }
     //set 2
      if( value !== undefined ){
          //elems jQuery实例对象
         for(var i = 0; i<length; i++ ){
           fn( elems[i], key, value);
         }
         return  elems;   
      }
    //get 返回  length==1
    return length ? fn( elems[0], key ) : undefined ;
   },
})
```


### $.text用法
```js
  console.log($('#box').text());
  console.log($('#box').text('3333'));
```

### $.text实现
```js
jQuery.fn = jQuery.prototype = { 
     text: function( value ){
       return jQuery.access( this, function( elem, value ){
         //value === undefined ? get :set
       return value === undefined ? jQuery.text( elem ) : jQuery.empty( elem, value );
       }, value );
     },
}

  jQuery.extend({
      access: function( elems, fn, key, value){   //this   value   fn  undefined
     var length = elems.length;
     var name;
     //判断用户是要get  set
     //set  1
      if( typeof key === "object" ) {
         //递归
         for( name in key ) {
            jQuery.access( elems, name, key[name], fn );
         }

         return elems;
      }
     //set 2
      if( value !== undefined ){
          //elems jQuery实例对象
         for(var i = 0; i<length; i++ ){
           fn( elems[i], key, value);
         }
         return  elems;   
      }
    //get 返回  length==1
    return length ? fn( elems[0], key ) : undefined ;
   },
})
```

### jQuery.access实现
```js
  jQuery.extend({
    access: function( elems, fn, key, value){   //this   value   fn  undefined
        var length = elems.length;
        var name;
        //判断用户是要get  set
        //set  1
        if( typeof key === "object" ) {
            //递归
            for( name in key ) {
            jQuery.access( elems, name, key[name], fn );
            }

            return elems;
        }
        //set 2
        if( value !== undefined ){
            //elems jQuery实例对象
            for(var i = 0; i<length; i++ ){
            fn( elems[i], key, value);
            }
            return  elems;   
        }
    //get 返回  length==1
    return length ? fn( elems[0], key ) : undefined ;
    },
  })
```

