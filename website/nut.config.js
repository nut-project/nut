module.exports = {
  zh: 'nut project',
  en: 'nut project',
  html: {
    title: 'NUT 文档',
  },
  logo: './logo.png',
  theme: 'ocean',
  layout: 'now',
  plugins: {

  },
  markdown: {
    theme: 'prism-tomorrow',
  },
  sidebar: [
    {
      icon: '',
      title: '指南',
      pages: [
        'pages/guide/introduction',
        'pages/guide/installation',
        'pages/guide/get-started',
        'pages/guide/layout',
        'pages/guide/plugin',
      ]
    },

    {
      icon: '',
      title: '文档',
      pages: [
        'pages/docs/cli',
        'pages/docs/api',
      ]
    },

    {
      icon: '',
      title: 'GitHub',
      link: 'https://github.com/fengzilong/nut'
    },
  ],
}
