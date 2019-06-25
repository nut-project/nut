export default ctx => {
  // 定制 pages/home 布局为 none
  ctx.api.page( 'pages/home' ).set( 'layout', 'none' )
}
