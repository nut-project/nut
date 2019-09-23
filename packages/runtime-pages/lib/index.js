/* eslint-disable indent */

const fs = require( 'fs' )
const path = require( 'path' )
const HtmlWebpackPlugin = require( 'html-webpack-plugin' )
const CopyPlugin = require( 'copy-webpack-plugin' )
const StatsWriterPlugin = require( 'webpack-stats-plugin' ).StatsWriterPlugin
const { getUniqueApplicationId } = require( './utils' )

const dirs = {
  runtime: path.join( __dirname, '../src' ),
  runtimeRoot: path.join( __dirname, '../' ),
  project: process.cwd(),
}

class PagesRuntime {
  async apply( driver = {} ) {
    const { env, api } = driver

    const nutConfig = await api.gatherer.api.getConfig()

    await this._base( driver, nutConfig )

    if ( env === 'production' ) {
      await this._prod( driver, nutConfig )
    } else {
      await this._dev( driver, nutConfig )
    }
  }

  async _base( driver = {}, nutConfig ) {
    const { api } = driver
    const config = api.webpack

    config.resolve.modules
      .add( path.join( dirs.runtimeRoot, '../../' ) )
      .add( path.join( dirs.runtimeRoot, 'node_modules' ) )

    config
      .entry( 'index' )
        .add( path.join( dirs.runtime, 'entries/default.js' ) )
        .end()

    let templatePath

    if ( nutConfig.html && nutConfig.html.template ) {
      templatePath = nutConfig.html && nutConfig.html.template
    } else if ( fs.existsSync( path.resolve( dirs.project, 'src/index.ejs' ) ) ) {
      templatePath = path.resolve( dirs.project, 'src/index.ejs' )
    } else {
      templatePath = path.join( dirs.runtime, 'template.ejs' )
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
            template: templatePath,
            title: ( nutConfig.html && nutConfig.html.title ) || nutConfig.zh || nutConfig.en,
            favicon: ( nutConfig.html && nutConfig.html.favicon ) || path.join( dirs.runtime, 'favicon.png' ),
            excludeChunks: [ 'child' ],
          }
        ] )
        .end()

    // setup child entry
    const appId = await getUniqueApplicationId( nutConfig )

    if ( appId ) {
      config.output.jsonpFunction( 'webpackJsonp_' + appId )
    }

    config
      .entry( 'child' )
        .add( path.join( dirs.runtime, 'entries/child.js' ) )
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

  async _dev( driver = {} ) {
    const { api, cli } = driver
    const config = api.webpack
    const webpack = api.require( 'webpack' )

    config.plugin( 'define' )
      .use( webpack.DefinePlugin, [
        {
          NUT_CLI_DYNAMIC: JSON.stringify( Boolean( cli.options.dynamic ) )
        }
      ] )

    if ( cli.options.dynamic ) {
      config.optimization
        .splitChunks( {
          chunks: 'initial'
        } )
    }
  }

  async _prod( driver = {}, nutConfig ) {
    const { api } = driver
    const webpack = api.require( 'webpack' )
    const config = api.webpack

    config.plugin( 'define' )
      .use( webpack.DefinePlugin, [
        {
          NUT_CLI_DYNAMIC: JSON.stringify( false )
        }
      ] )

    const appId = await getUniqueApplicationId( nutConfig )

    config.plugin( 'mini-css-extract' )
      .tap( args => {
        if ( args[ 0 ] ) {
          args[ 0 ].attrs = {
            'data-appid': appId
          }
        }

        return args
      } )
  }
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

module.exports = PagesRuntime
