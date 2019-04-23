module.exports = {
  port: 9000,
  zh: 'nut',
  en: 'nut',
  logo: '',
  html: {
    title: '文档标题',
  },
  layout: 'kaola',
  theme: 'ocean',
  plugins: {
    login: {
      path: require.resolve( './plugins/login' ),
      enable: true,
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
  devServer: {
    proxy: {
      '/api': 'http://127.0.0.1:7000'
    }
  },
  sidebar: [
    {
      icon: 'sketch',
      title: '宝石',
      children: [
        'pages/home/home',
        'pages/home/regular',
        'pages/home/vue',
        'pages/home/index',
      ]
    },
    {
      icon: 'read',
      title: '文档',
      children: [
        'pages/documents/index',
        'pages/documents/reference',
      ],
    },
  ],
  // homepage 和 landing page 二选一
  homepage: 'pages/index',
  landing: {
    template: 'default',
    options: {
      title: '某个不知名的系统',
      description: '哈哈哈',
      preview: '',
      buttonText: '',
    },
  },
}
