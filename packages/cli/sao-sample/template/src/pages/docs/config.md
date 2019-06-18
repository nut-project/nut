nut 的配置文件位于 `nut.config.js`，你可以在这里自定义 nut 配置

你可以使用 `process.env.NODE_ENV` 来判断当前的环境

## 配置

| 字段                   |                                                                                    说明 |              默认值              |
| ---------------------- | ---------------------------------------------------------------------------------------:|:--------------------------------:|
| host                   |                                                                              监听的host |            127.0.0.1             |
| port                   |                                                                              监听的端口 |               9000               |
| zh                     |                                                                              应用中文名 |                -                 |
| en                     |                                                                              应用英文名 |                -                 |
| logo                   |                                                                               应用 logo |                -                 |
| html.title             |                                                                                文档标题 |               `zh`               |
| html.favicon           |                                                                                 favicon |             nut logo             |
| markdown.theme         |                                                                   markdown 代码高亮主题 |          prism-tomorrow          |
| layout                 |                                              布局，可选值：default / saber / now / none |             default              |
| theme                  |                                                        配色方案，可选值：ocean / sakura |              ocean               |
| plugins                |                                                                                    插件 |                []                |
| sidebar                |                                                                                菜单管理 |                []                |
| devServer              |                                                                 webpack dev server 配置 |                -                 |
| configureWebpack       | 配置 webpack，内部使用 [webpack-merge](https://github.com/survivejs/webpack-merge) 合并 |                -                 |
| chainWebpack           | 精细配置 webpack，语法参考 [webpack-chain](https://github.com/neutrinojs/webpack-chain) |                -                 |
| babel.transpileModules |                                                  node_modules 中需要被 babel 编译的模块 |                []                |
| router.mode            |                                                        路由模式，可选值：hash / history |               hash               |
| router.alias           |                                                  格式：{ 'pages/foo/bar': 'new-alias' } |                -                 |
| router.cacheable       |                                                                    控制页面实例是否缓存 | 格式：{ 'pages/foo/bar': false } |
| homepage               |                           指定首页，比如'pages/foo/bar'，等价于ctx.api.homepage.set(  ) |                -                 |
| output.publicPath      | 修改 publicPath                                                                                        |                 '/'                 |

## 示例

```js
module.exports = {
  zh: 'NUT 项目',
  en: 'NUT PROJECT',
  html: {
    title: 'NUT 文档',
  },
  logo: './logo.png',
  theme: 'ocean',
  layout: process.env.NODE_ENV === 'development' ? 'default' : 'now',
  plugins: {
    foo: {
      path: require.resolve( 'path/to/plugin' ),
      enable: false,
      env: [ 'development' ],
    },
  },
  markdown: {
    theme: 'prism-tomorrow',
  },
  sidebar: [
    {
      icon: '',
      title: '指南',
      children: [
        'pages/guide/introduction',
        'pages/guide/installation',
      ]
    },

    {
      icon: '',
      title: 'GitHub',
      link: 'https://github.com/fengzilong/nut'
    },
  ],
  configureWebpack: {
    resolve: {
      alias: {
        key: 'value'
      }
    }
  },
  chainWebpack( config ) {
    // https://github.com/neutrinojs/webpack-chain
    config.resolve.alias.set( 'key', 'value' )
    if ( process.env.NODE_ENV === 'development' ) {
      // ...
    }
  },
  babel: {
    transpileModules: [ 'vue-echarts', 'resize-detector' ]
  }
}
```
