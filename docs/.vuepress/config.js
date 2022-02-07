
module.exports = {
    title: 'Jquery专题教程',
    description: 'Jquery专题教程',
    base: '/jquery/',
    port: 8080,
    themeConfig: {
      displayAllHeaders: true,
      sidebar: [
          ['/init', 'jQuery初始化'],
          ['/extend', "extend实现深浅拷贝"],
          ['/selector', "实现选择器引擎"],
          ['/each', "实现遍历each"],
          ['/load-dom', "DOM加载回调"],
          ['/handle-dom', "操作DOM"],
          ['/callbacks', "$.Callbacks添加回调列表"],
          ['/async-callback', "处理异步回调"]
      ]
    }
  }