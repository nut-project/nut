nut 的配置文件位于 `nut.config.js`，你可以在这里自定义 nut 配置

## 配置

| 字段             |                                          说明 |     默认值     |
| ---------------- | ---------------------------------------------:|:--------------:|
| host             |                                    监听的host |   127.0.0.1    |
| port             |                                    监听的端口 |      9000      |
| zh               |                                    应用中文名 |       -        |
| en               |                                    应用英文名 |       -        |
| logo             |                                     应用 logo |       -        |
| html.title       |                                      文档标题 |      `zh`      |
| html.favicon     |                                       favicon |    nut logo    |
| markdown.theme   |                         markdown 代码高亮主题 | prism-tomorrow |
| layout           |    布局，可选值：default / saber / now / none |    default     |
| theme            |              配色方案，可选值：ocean / sakura |     ocean      |
| plugins          |                                          插件 |       []       |
| sidebar          |                                      菜单管理 |       []       |
| devServer        |                       webpack dev server 配置 |       -        |
| configureWebpack | 配置 webpack，内部使用 webpack-merge 进行合并 |       -        |
| chainWebpack                 |        精细配置 webpack，语法参考 [webpack-chain](https://github.com/neutrinojs/webpack-chain)                                       |       -         |

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
  layout: 'now',
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
  }
}
```
