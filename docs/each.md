## jQuery.each

场景： 遍历数组或者对象

示例代码如下：
```js
----------------------------jQuery.each-------------------------------------
 /**
 * @param {obj} 目标源 
 * @param {callback}  回调函数
 * @param {obj} 自定义回调函数参数
 * 
*/
var obj = {name: "alan", habbit: "football"};
var arr = [
    {
        hello1: 1,
        world2: 2
    },
    {
        hello3: 3,
        world4: 4
    }
]
var result = jQuery.each(arr, function(item, index) {
    console.log(this);  // 注意this的指向，指向当前对象
    console.log(item, index);
}, ["alan", 11]);

console.log(result); 
```

### each源码实现
```js
jQuery.extend({
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
})
```