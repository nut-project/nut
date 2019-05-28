export default ctx => {
  ctx.api.sidebar.configure( [
    {
      title: '测试',
      children: [
        { title: 'a', path: 'docs/pages/a' },
        { title: 'c', path: 'demo/pages/c' },
      ]
    },
    {
      title: '测试2',
      children: [
        { title: 'b', path: 'docs/pages/b' },
        { title: 'd', path: 'demo/pages/d' },
      ]
    }
  ] )
}
