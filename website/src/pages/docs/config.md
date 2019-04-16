---
title: Config
---

nut 的配置文件位于 `nut.config.js`，你可以在这里自定义 nut 配置

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
}
```

## 配置

| 字段           |                                       说明 |     默认值     |
| -------------- | ------------------------------------------:|:--------------:|
| zh             |                                 应用中文名 |       -        |
| en             |                                 应用英文名 |       -        |
| logo           |                                  应用 logo |       -        |
| html.title     |                                   文档标题 |      `zh`      |
| html.favicon   |                                    favicon |    nut logo    |
| markdown.theme |                      markdown 代码高亮主题 | prism-tomorrow |
| layout         | 布局，可选值：default / saber / now / none |    default     |
| theme          |           配色方案，可选值：ocean / sakura |     ocean      |
| plugins        |                                       插件 |       []       |
| sidebar        |                                   菜单管理 |       []       |
