module.exports = {
  zh: '{{ zh }}',
  layout: 'now',
  markdown: {
    theme: 'prism-duotone-light',
  },
  plugins: [
    '@nut-plugins/pages-microfrontends',
    '@nut-plugins/pages-layout-now',
  ],
  sidebar: [
    {
      title: 'Menu',
      children: [
        { title: 'demo', path: 'pages/demo' },
        { title: 'markdown', path: 'pages/markdown' },
      ]
    }
  ],
  homepage: 'pages/home',
}
