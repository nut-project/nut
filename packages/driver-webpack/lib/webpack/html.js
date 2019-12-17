const path = require( 'path' )
const HtmlWebpackPlugin = require( 'html-webpack-plugin' )
const InlineChunkHtmlPlugin = require( './plugins/InlineChunkHtmlPlugin' )
const HtmlCheerioPlugin = require( './plugins/HtmlCheerioPlugin' )

exports.extend = function ( config, context = {} ) {
  const { userConfig = {} } = context
  const pages = userConfig.pages
  const html = userConfig.output && userConfig.output.html

  const defaultOptions = {
    filename: `index.html`,
    template: path.join( __dirname, 'template.ejs' ),
  }

  if ( context.env === 'production' ) {
    Object.assign( defaultOptions, {
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      }
    } )
  }

  // splitChunks
  config.optimization.splitChunks( {
    cacheGroups: {
      vendors: {
        name: `chunk-vendors`,
        test: /[\\/]node_modules[\\/]/,
        priority: -10,
        chunks: 'initial'
      },
      common: {
        name: `chunk-common`,
        minChunks: 2,
        priority: -20,
        chunks: 'initial',
        reuseExistingChunk: true
      }
    }
  } )
  config.optimization.runtimeChunk( true )

  if ( pages ) {
    for ( const entryName of Object.keys( pages ) ) {
      const page = Object.assign( {}, defaultOptions, {
        filename: `${ entryName }.html`,
        chunks: [ 'chunk-vendors', 'chunk-common', entryName ]
      }, typeof pages[ entryName ] === 'string' ? {} : pages[ entryName ] )

      delete page.entry

      config
        .plugin( `html-page-${ entryName }` )
        .use( HtmlWebpackPlugin, [ page ] )
    }
  } else {
    const page = Object.assign( {}, defaultOptions, html ? {
      title: html.title,
      filename: html.filename || defaultOptions.filename,
      favicon: html.favicon,
      template: html.template || defaultOptions.template,
    } : undefined )

    config
      .plugin( 'html' )
      .use( HtmlWebpackPlugin, [ page ] )
  }

  config.plugin( 'html-inline-chunk' )
    .use( InlineChunkHtmlPlugin, [
      HtmlWebpackPlugin,
      [ /runtime/ ],
    ] )

  // for expose cheerio
  config.plugin( 'html-cheerio' )
    .use( HtmlCheerioPlugin )
}

exports.expose = function ( driver ) {
  driver.expose( 'cheerio', callback => {
    if ( typeof callback !== 'function' ) {
      return
    }

    driver.useHook( 'dangerously_chainWebpack', config => {
      config.plugin( 'html-cheerio' )
        .tap( ( [ callbacks = [] ] = [] ) => {
          callbacks.push( callback )

          return [ callbacks ]
        } )
    } )
  } )
}
