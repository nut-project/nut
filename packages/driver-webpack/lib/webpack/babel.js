const createInclude = require( './shared/create-include' )

exports.extend = function ( config, context = {} ) {
  const { env, userConfig = {} } = context
  const { babel = {} } = userConfig

  const rule = config.module.rule( 'js' )

  rule.test( [ /\.m?js$/, /\.jsx$/ ] )

  rule.include.add( createInclude( babel && babel.transpileModules ) )

  rule.use( 'babel' )
    .loader( require.resolve( './babel/loader' ) )
    .options( {
      cacheCompression: env === 'production',
      presets: []
    } )
}
