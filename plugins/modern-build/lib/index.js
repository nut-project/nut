const copy = require( 'fast-copy' )
const ModernBuildWebpackPlugin = require( './plugin' )

class ModernBuildPlugin {
  constructor( options = {} ) {
    this._options = options
  }

  apply( ctx ) {
    const { api, hook } = ctx.use( 'webpack' )

    hook( 'env', env => {
      if ( env !== 'production' ) {
        return
      }

      hook( 'dangerously_chainWebpack', config => {
        config.module.rule( 'js' )
          .use( 'babel' )
          .tap( options => {
            options.isModern = true
            return options
          } )

        config.optimization.runtimeChunk( false )

        let legacyTerserPluginOptions = {}
        config.optimization.minimizer( 'js' )
          .tap( ( [ options = {} ] ) => {
            legacyTerserPluginOptions = copy( options )
            options.terserOptions.module = true
            options.terserOptions.ecma = 2017
            return [ options ]
          } )

        const options = {
          api: {
            webpackRequire: api.dangerously_webpackRequire,
            driverRequire: api.dangerously_require
          },
          legacyTerserPluginOptions,
        }

        config.plugin( 'modern-build' )
          .use( ModernBuildWebpackPlugin, [ options ] )
      } )
    } )
  }
}

module.exports = ModernBuildPlugin
