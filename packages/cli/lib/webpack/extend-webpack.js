/* eslint-disable indent */

const path = require( 'path' )
const HtmlWebpackPlugin = require( 'html-webpack-plugin' )
const CopyPlugin = require( 'copy-webpack-plugin' )
const StatsWriterPlugin = require( 'webpack-stats-plugin' ).StatsWriterPlugin

const dirs = {
  cli: path.join( __dirname, '../../' ),
  project: process.cwd(),
}

exports.normal = function ( config, nutConfig ) {
  if ( nutConfig.type === 'host' ) {
    config
      .entry( 'index' )
        .add( path.join( dirs.cli, 'lib/runtime/entries/host.js' ) )
        .end()
  } else {
    config
      .entry( 'index' )
        .add( path.join( dirs.cli, 'lib/runtime/entries/single.js' ) )
        .end()
  }
  config
    .plugin( 'copy' )
      .use( CopyPlugin, [
        [
          {
            from: {
              glob: '**/*',
              dot: true
            },
            to: '.',
            ignore: [ '.DS_Store' ]
          }
        ],
        {
          context: path.join( dirs.project, 'src/public' )
        }
      ] )
      .end()
    .plugin( 'html' )
      .use( HtmlWebpackPlugin, [
        {
          ...( nutConfig.html || {} ),
          template: ( nutConfig.html && nutConfig.html.template ) || path.join( __dirname, './template.ejs' ),
          title: ( nutConfig.html && nutConfig.html.title ) || nutConfig.zh || nutConfig.en,
          favicon: ( nutConfig.html && nutConfig.html.favicon ) || path.join( __dirname, '../runtime/favicon.png' ),
          excludeChunks: [ 'child' ],
        }
      ] )
      .end()
}

function getFilesFromChunk( chunk ) {
  const files = []

  if ( Array.isArray( chunk ) ) {
    const jsfiles = chunk.filter( file => file.endsWith( '.js' ) )
    files.push( ...jsfiles )
  } else if ( typeof chunk === 'string' ) {
    if ( chunk.endsWith( '.js' ) ) {
      files.push( chunk )
    }
  }

  return files
}

exports.child = function ( config, nutConfig, appId ) {
  config
    .entry( 'child' )
      .add( path.join( dirs.cli, 'lib/runtime/entries/child.js' ) )
      .end()

  config.plugin( 'stats-write' )
    .use( StatsWriterPlugin, [
      {
        filename: 'manifest.json',
        transform( data, opts ) {
          const files = [
            ...getFilesFromChunk( data.assetsByChunkName.vendors ),
            ...getFilesFromChunk( data.assetsByChunkName.child ),
          ]

          let publicPath = '/'

          try {
            publicPath = opts.compiler.options.output.publicPath
          } catch ( e ) {}

          return JSON.stringify( {
            files,
            id: appId,
            publicPath,
          }, 0, 2 )
        }
      }
    ] )

    // config.plugin( 'nut-manifest' )
    //   .use( NutManifestPlugin, [
    //     {
    //       filename: 'manifest.js',
    //
    //     }
    //   ] )
  // use jsonp to fix cors issue
  config.plugin( 'stats-write-js' )
    .use( StatsWriterPlugin, [
      {
        filename: 'manifest.js',
        transform( data, opts ) {
          const compiler = opts.compiler

          const childFiles = getFilesFromChunk( data.assetsByChunkName.child )
          const source = childFiles
            .map( file => compiler.assets[ file ].source() )
            .join( '\n' )

          let publicPath = '/'

          try {
            publicPath = opts.compiler.options.output.publicPath
          } catch ( e ) {}

          const json = JSON.stringify( {
            files: [],
            id: appId,
            publicPath,
          } )

          // TODO: 把 child.js 写入 manifest，从 files 中移除 child.js
          return `
( function () {
if ( window.nutManifestJSONP ) {
  var currentScript = document.currentScript
  var dataset = currentScript ? currentScript.dataset : {}
  window.nutManifestJSONP( ${ json }, dataset )
}
} )();
${ source }
`.trim()
        },
        fields: null
      }
    ] )
}
