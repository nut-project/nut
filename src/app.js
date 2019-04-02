export default async function app( ctx ) {
  console.log( ctx.env ) // -> development / production
  console.log( await ctx.plugins.login.getUser() ) // use plugin exposed method
}
