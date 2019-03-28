module.exports = {
  zh: '某个不知名的系统',
  en: 'pmp',
  markdown: {
    theme: 'prism-tomorrow',
  },
  theme: 'sakura',
  layout: 'saber',
  sidebar: [
    {
      icon: 'sketch',
      title: '宝石',
      pages: [
        'pages/home/foo',
        'pages/home/bar',
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
