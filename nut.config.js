module.exports = {
  zh: '某个不知名的系统',
  en: 'pmp',
  markdown: {
    theme: 'prism-tomorrow',
  },
  theme: 'ocean',
  layout: 'default',
  sidebar: [
    {
      icon: 'sketch',
      title: '宝石',
      pages: [
        'pages/home/foo/index',
        'pages/home/bar/index',
        '!pages/home/demo/_id', // 隐藏页面（!）
      ]
    },
    {
      icon: 'read',
      title: '文档',
      pages: [
        'pages/documents/index',
        'pages/documents/reference',
      ],
    },
  ],
}
