const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' )
const { applyCSSRule } = require( './shared/apply-css-rule' )
const localResolve = require( './shared/local-resolve' )
const localRequire = require( './shared/local-require' )

exports.extend = function ( config, context = {} ) {
  const { env = '', userConfig = {} } = context

  let extractCSS = userConfig && userConfig.css && userConfig.css.extract
  if ( typeof extractCSS !== 'boolean' ) {
    extractCSS = env === 'production'
  }

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

  applyCSSRule( config, 'css', /\.css$/, null, {}, extractCSS )

  applyCSSRule( config, 'less', /\.less$/, 'less-loader', {}, extractCSS )

  applyCSSRule( config, 'scss', /\.scss$/, 'sass-loader', scssOptions, extractCSS )

  applyCSSRule( config, 'sass', /\.sass$/, 'sass-loader', sassOptions, extractCSS )

  applyCSSRule( config, 'mcss', /\.mcss$/, 'mcss-loader', {}, extractCSS )

  applyCSSRule( config, 'stylus', /\.styl(us)?$/, 'stylus-loader', {
    preferPathResolver: 'webpack',
  }, extractCSS )

  if ( extractCSS ) {
    config
      .plugin( 'extract-css' )
      .use( MiniCssExtractPlugin, [ {
        filename: `[name].[contenthash].css`,
        chunkFilename: `[name].[contenthash].css`,
      } ] )
  }
}
