#### axios

```js
ctx.axios.get( ... )
ctx.axios.post( ... )
```

参考 [axios](https://github.com/axios/axios)

#### layout.register

注册一个新的 layout，一般使用于插件内部

```js
await ctx.api.layout.register( {
  name: 'layout-name',
  mount( node, { ctx } ) {},
  unmount( node ) {},
  update( data = {} ) {},
  getMountNode() {}
} )
```

#### page

配置页面的基本属性，常见的比如 cacheable、layout

```js
ctx.page( 'pages/foo' ).get( 'key' )
ctx.page( 'pages/foo' ).set( 'cacheable', false )
ctx.page( 'pages/foo' ).set( 'layout', 'none' )
```

#### router.format

路由解析

```js
ctx.api.router.format( {
  page: 'pages/foo/_id',
  query: { key: 'value' },
  params: { id: '123' }
} )

// -> /pages/foo/123?key=value
```

#### router.push

路由跳转

```js
ctx.api.router.push( {
  page: 'pages/foo/_id',
  query: { key: 'value' },
  params: { id: '123' }
} )

// -> 跳转至新路由 /pages/foo/123?key=value
```

#### router.replace

路由跳转，类似 push，但是会覆盖当前路由

```js
ctx.api.router.replace( {
  page: 'pages/foo/_id',
  query: { key: 'value' },
  params: { id: '123' }
} )

// -> 跳转至新路由 /pages/foo/123?key=value
```

#### sidebar.get

获取 sidebar

```js
ctx.sidebar.get()
```

#### sidebar.configure

配置 sidebar

```js
ctx.sidebar.configure( [
  {
    title: 'hello',
    icon: '',
    children: [
      { title: '标题', page: 'pages/hello' }
    ],
  },
  {
    title: 'world',
    link: 'https://github.com'
  }
] )
```
