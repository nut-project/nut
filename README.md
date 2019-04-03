# nut-project

**开发中**

<img src="./media/hmr.gif" alt="hmr.gif" width="600px">
<img src="./media/markdown-theme-hmr.gif" alt="markdown-theme-hmr.gif" width="600px">

## 特性

- 灵活的 layout 机制
- 基于文件系统的路由
- 支持自定义主题
- 500+ 的内置图标
- 内置的 markdown 支持
- 内置的许多指令
- 事件系统
- 配置管理
- 热重载
- 插件化

## 内置 layout

### default

| ocean | sakura |
| :---: | :---: |
| ![ocean](./media/default-ocean.jpg) | ![sakura](./media/default-sakura.jpg) |

### saber

| ocean | sakura |
| :---: | :---: |
| ![ocean](./media/saber-ocean.jpg) | ![sakura](./media/saber-sakura.jpg) |

### 如何写一个 layout

...

### 如何写一个 plugin

一个标准的 plugin 是这样子的

```js
exports.name = 'your-superb-plugin'
exports.type = 'login' // 一些特殊类型的插件需要执行，大多数情况下你可以省略
exports.apply = function ( ctx = {}, options = {} ) {
  const { api, events } = ctx

  api.expose( 'method_name', () => {} )
  api.expose( 'prop', 'value' )

  events.on( 'system:before-startup', async ctx => {
    await api.axios() // ...do some request
    await events.pluginEmit( 'some-event', data ) // emit some events
  } )
}
```

你可以通过 插件 向 应用 暴露一些方法，也可以监听`系统事件`，以及抛出插件内部的事件

#### 使用插件

nut.config.js

```js
module.exports = {
  plugins: {
    superb: {
      package: 'your-superb-plugin',
      enable: true,
    }
  }
}
```

superb 是插件在当前应用中使用的名字

以上面的插件代码为例

```js
// plugin exposed
ctx.plugins.superb.method_name()
ctx.plugins.superb.prop
// plugin events
ctx.events.on( 'plugin:superb:some-event', async data => {} )
```

完整的 api(开放接口) 请查看 [文档](./docs/api.md)
完整的 events(系统事件) 请查看 [文档](./docs/events.md)


## 如何开始

```bash
yarn global add @nut-project/cli
```

```bash
nut # develop locally
nut --prod # build for production
```
