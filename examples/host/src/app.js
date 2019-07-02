export default ctx => {
  ctx.api.sidebar.configure( [
    {
      title: '菜单',
      children: [
        { title: 'docs', path: 'nut/pages/home' },
        { title: 'todomvc', path: 'todomvc/pages/home' },
      ]
    },
  ] )
}
