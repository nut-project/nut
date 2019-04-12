module.exports = {
  zh: 'nut-project',
  en: 'nut-project',
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
        'pages/guide/plugin',
        'pages/guide/layout',
      ]
    },

    {
      icon: '',
      title: 'API',
      pages: [
        'pages/api/context'
      ]
    },

    {
      icon: '',
      title: 'GitHub',
      link: 'https://github.com/fengzilong/nut'
    },
  ],
}
