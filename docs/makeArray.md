## $.markArray

### $.markArray和$.merge用法
```js
// 类数组转数组
function fn() {
    var args = jQuery.makeArray(arguments);
    args.push("alan3");
    console.log(args)
}
// fn("alan1", "alan2");  // ["alan1", "alan2", "alan3"]
var arr = [1,2]
console.log(jQuery.merge(arr, {"0": "alan6", "1": "alan7"}));  // [1, 2, 'alan6', 'alan7']
```

### $.makeArray和$.merge源码实现
```js
// jQuery部分源码
jQuery.extend({
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
```