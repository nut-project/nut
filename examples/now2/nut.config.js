module.exports = {
  port: 9002,
  zh: 'now2',
  layout: 'now2',
  markdown: {
    theme: 'prism-duotone-light',
  },
  sidebar: [
    {
      title: 'Menu',
      children: [
        {
          title: 'Menu2',
          children: [
            { title: 'Demo', path: 'pages/demo' },
          ]
        },
        {
          title: 'Menu3',
          children: [
            { title: 'Demo2', path: 'pages/demo2' },
            {
              title: 'Leaf',
              children: [
                { title: 'Markdown', path: 'pages/markdown' },
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Menu2',
      children: [
        {
          title: 'Menu3',
          children: [
            { title: 'Demo3', path: 'pages/demo3' },
          ]
        }
      ]
    }
  ],
  homepage: 'pages/home',
}
