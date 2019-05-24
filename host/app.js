export default ctx => {
  ctx.api.sidebar.configure( [
    {
      title: '',
      children: [
        { title: '', page: 'demo:pages/home/index' },
      ]
    }
  ] )
}
