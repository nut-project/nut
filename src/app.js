export default async function app( ctx ) {
  ctx.env // -> development / production
  // await ctx.plugins.login.getUser() // use plugin exposed method
  ctx.config // -> from ./config/config.{env}.js
  // ctx.api.setUserMenu( [
  //   { text: '个人中心', click() {} },
  //   { role: 'logout' },
  // ] )
}
