export default ctx => {
  const service = ctx.use( 'microfrontends', 'service' )
  const palette = ctx.use( 'microfrontends', 'palette' )

  palette.append( {
    text: '应用信息',
    click( { hide } ) {
      console.log( '应用信息' )
      hide()
    },
  } )

  palette.append( {
    text: '物料市场',
    async click( { hide } ) {
      const materials = await service.call( 'get-blocks' ) || {}
      console.log( materials )
      hide()
    },
  } )

  palette.append( {
    text: '关于',
    click( { hide } ) {
      console.log( '关于' )
      hide()
    },
  } )
}
