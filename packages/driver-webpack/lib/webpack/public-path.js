exports.extend = function ( config, context = {} ) {
  const output = context.userConfig.output

  if ( output && output.publicPath ) {
    config.output.publicPath( output.publicPath )
  } else {
    config.output.publicPath( '/' )
  }
}

exports.expose = function ( driver ) {
  driver.expose( 'publicPath', pp => {
    driver.useHook( 'dangerously_chainWebpack', config => {
      config.output.publicPath( pp )
    } )
  } )
}
