module.exports = {
  zh: '某个不知名的系统',
  en: 'pmp',
  markdown: {
    theme: 'prism-tomorrow',
  },
  theme: 'ocean',
  layout: 'default',
  plugins: [
    require.resolve( './plugins/login-netease-openid' ),
  ],
  landing: {
    use: 'default',
    options: {
      title: '某个不知名的系统',
      description: '哈哈哈',
      preview: '',
      buttonText: '',
    },
  },
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
