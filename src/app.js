export default async function app( ctx ) {
  ctx.env // -> development / production
  ctx.pages
  const link = ctx.api.router.format( {
    page: 'pages/home/demo/_id',
    params: { id: 123 },
  } )
  console.log( 'link', link )

  ctx.api.router.beforeEach( ctx => {
    console.log( 'hello before each' )
  } )

  ctx.api.router.push( {
    page: 'pages/home/regular',
    query: { a: 'b' },
    // layout: 'saber'
  } )

  await ctx.use( 'login', 'getUser' ) // use exposed methods from plugin
  ctx.config // -> from ./config/config.{env}.js
  // ctx.use( 'layout', 'setUserMenu', [
  //   { text: '个人中心', click() {} },
  //   { role: 'logout' },
  // ] )

  ctx.api.sidebar.configure( [
    {
      icon: 'sketch',
      title: '宝石',
      children: [
        { title: 'home', path: 'pages/home/home' },
        { title: 'regular', path: 'pages/home/regular' },
        { title: 'vue', path: 'pages/home/vue' },
        { title: '测试', path: 'pages/home/index' },
      ]
    },
    {
      icon: 'read',
      title: '文档',
      children: [
        { title: '如何使用', path: 'pages/documents/index' },
        { title: 'API 指南', path: 'pages/documents/reference' },
      ],
    },
  ] )

  ctx.api.page( 'pages/home/index' ).set( 'cacheable', true )
}
