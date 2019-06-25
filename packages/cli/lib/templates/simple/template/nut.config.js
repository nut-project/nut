module.exports = {
  // 应用名
  zh: '{{ zh }}',
  // 布局
  layout: 'now',
  markdown: {
    // markdown 高亮主题
    // 所有高亮主题见：https://nut.js.org/pages/guide/markdown
    theme: 'prism-duotone-light',
  },
  // 菜单生成
  sidebar: [
    {
      title: 'Menu',
      children: [
        { title: 'demo', path: 'pages/demo' },
        { title: 'markdown', path: 'pages/markdown' },
      ]
    }
  ],
  // 访问 `/` 时实际访问的页面
  homepage: 'pages/home',
}
