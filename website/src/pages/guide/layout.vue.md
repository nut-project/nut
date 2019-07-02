## 内置布局

nut 内置了以下几套布局

- default
- saber
- now
- kaola
- none

## 全局布局

你可以在 `nut.config.js` 中通过 `layout` 声明全局布局，如果页面未声明自己的 layout，就会降级到 全局主题

## 页面布局

如何定制某个页面的布局呢？

很简单，在 `src/app.js` 中

```js
export default ctx => {
  ctx.api.page( 'pages/path', 'layout-name' )
}
```

每个页面的布局都可以不同，当然大部分情况下你不需要这么花里胡哨

<zi-note label="Tips">
  比较常用的是 none 这个特殊布局，none 布局几乎没有任何内容，相当于一个“空的画板”，你可以在这个基础上定制你的页面内容
</zi-note>

## 如何实现新布局

在 nut 中，你可以通过写一个插件来注册一个新的布局（插件的基本写法请参见插件章节）

涉及的 API：`ctx.api.layout.register`

```js
ctx.api.layout.register( {
  name: 'your-layout-name', // 布局名称，用户使用该布局时需要用到
  mount( node ) {}, // 挂载时调用
  unmount( node ) {}, // 卸载时调用
  update( data ) {}, // 热重载时调用
  getMountNode() {}, // 页面挂载点，需返回一个 DOM 节点的引用
} )
```

如果是通用的布局，你可以将该布局插件发布到 npm 上和组内的成员进行共享
