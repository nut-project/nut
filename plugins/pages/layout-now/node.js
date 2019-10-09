module.exports = async function ( ctx ) {
  ctx.rebuild()
  ctx.chainWebpack( webpack => {

  } )

  ctx.gatherer.watchConfig( 'layout', () => {
    ctx.writeFile(  )
    ctx.addRoute(  )
  } )

  ctx.gatherer.watchFile( '', () => {

  } )

  // like ctx.body
  ctx.data = { foo: 'bar' }
}
