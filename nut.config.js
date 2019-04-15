module.exports = {
  zh: 'nut',
  en: 'nut',
  html: {
    title: '文档标题',
  },
  theme: 'ocean',
  layout: 'now',
  plugins: {
    login: {
      path: require.resolve( './plugins/login-netease-openid' ),
      enable: false,
      // env: [ 'development' ],
    },
    test: {
      path: require.resolve( './plugins/test' ),
    },
    notfound: {
      path: require.resolve( './plugins/notfound' ),
    },
  },
  markdown: {
    theme: 'prism-okaidia',
  },
  sidebar: [
    {
      icon: 'sketch',
      title: '宝石',
      pages: [
        'pages/home/home',
        'pages/home/regular',
        'pages/home/vue',
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
  landing: {
    use: 'default',
    options: {
      title: '某个不知名的系统',
      description: '哈哈哈',
      preview: '',
      buttonText: '',
    },
  },
}
