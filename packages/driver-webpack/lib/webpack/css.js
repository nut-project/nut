const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' )
const { applyCSSRule } = require( './shared/apply-css-rule' )
const localResolve = require( './shared/local-resolve' )
const localRequire = require( './shared/local-require' )

exports.extend = function ( config, context = {} ) {
  // perfer local sass/node-sass, fallback to sass in driver-webpack
  // as dart-sass does not support /deep/ syntax(use ::v-deep instead)
  // for more details, see https://github.com/vuejs/vue-cli/issues/3399
  const scssOptions = {}

  if ( ( localResolve( 'node-sass' ) ) ) {
    scssOptions.implementation = localRequire( 'node-sass' )
  } else if ( ( localResolve( 'sass' ) ) ) {
    scssOptions.implementation = localRequire( 'sass' )
  } else {
    scssOptions.implementation = require( 'sass' )
  }

  const sassOptions = Object.assign( {}, scssOptions, {
    indentedSyntax: true,
  } )

  applyCSSRule( config, 'css', /\.css$/, null, {}, context.env )

  applyCSSRule( config, 'less', /\.less$/, 'less-loader', {}, context.env )

  applyCSSRule( config, 'scss', /\.scss$/, 'sass-loader', scssOptions, context.env )

  applyCSSRule( config, 'sass', /\.sass$/, 'sass-loader', sassOptions, context.env )

  applyCSSRule( config, 'mcss', /\.mcss$/, null, {}, context.env )

  applyCSSRule( config, 'stylus', /\.styl(us)?$/, 'stylus-loader', {
    preferPathResolver: 'webpack',
  }, context.env )

  if ( context.env === 'production' ) {
    config
      .plugin( 'extract-css' )
      .use( MiniCssExtractPlugin, [ {
        filename: `[name].[contenthash].css`,
        chunkFilename: `[name].[contenthash].css`,
      } ] )
  }
}
