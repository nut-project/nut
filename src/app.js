export default async function app( ctx ) {
  ctx.env // -> development / production
  ctx.pages
  const link = ctx.api.getPageLink( 'pages/home/demo/_id', {
    id: 123
  } )
  console.log( 'link', link )
  await ctx.use( 'login', 'getUser' ) // use plugin exposed method
  ctx.config // -> from ./config/config.{env}.js
  // ctx.api.setUserMenu( [
  //   { text: '个人中心', click() {} },
  //   { role: 'logout' },
  // ] )
}
