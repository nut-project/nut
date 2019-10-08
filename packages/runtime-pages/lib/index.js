/* eslint-disable indent */

const fs = require( 'fs' )
const path = require( 'path' )
const chalk = require( 'chalk' )
const boxen = require( 'boxen' )
const open = require( 'open' )
const exit = require( 'exit' )
const address = require( 'address' )
const HtmlWebpackPlugin = require( 'html-webpack-plugin' )
const CopyPlugin = require( 'copy-webpack-plugin' )
const StatsWriterPlugin = require( 'webpack-stats-plugin' ).StatsWriterPlugin
const { getUniqueApplicationId } = require( './utils' )
const VirtualModulesPlugin = require( '@nut-project/webpack-virtual-modules' )
const generateModules = require( './generate-modules' )

const DEFAULT_HOST = '0.0.0.0'
const DEFAULT_PORT = 9000

const dirs = {
  runtime: path.join( __dirname, '../src' ),
  runtimeRoot: path.join( __dirname, '../' ),
  project: process.cwd(),
}

class PagesRuntime {
  async apply( driver = {} ) {
    const { env, api } = driver

    const nutConfig = await api.gatherer.getConfig()

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

  async _dev( driver = {}, nutConfig ) {
    const { api, events, cli } = driver
    const config = api.webpack
    const gatherer = api.gatherer

    config.plugin( 'define' )
      .tap( args => {
        if ( !args[ 0 ] ) {
          args.push( {} )
        }
        const definitions = args[ 0 ]
        definitions.NUT_CLI_DYNAMIC = JSON.stringify( Boolean( cli.options.dynamic ) )
        return [
          definitions
        ]
      } )

    if ( cli.options.dynamic ) {
      config.optimization
        .splitChunks( {
          chunks: 'initial'
        } )
    }

    // setup virtual modules
    const modules = await generateModules( await gatherer.getArtifacts(), {
      env: 'dev',
      cliOptions: cli.options,
      dynamicPages: [],
      lockedDynamicPages: [],
    } )

    let virtualModules

    config.plugin( 'virtual-modules' )
      .init( ( Plugin, args ) => {
        virtualModules = new Plugin( ...args )
        return virtualModules
      } )
      .use( VirtualModulesPlugin, [ modules ] )

    // setup dev server
    events.on( 'ready', config => {
      this._setupDevServer( config, driver, nutConfig, virtualModules )
    } )
  }

  async _setupDevServer( webpackConfig, driver = {}, nutConfig, virtualModules ) {
    const { api, cli } = driver
    const gatherer = api.gatherer
    const host = nutConfig.host || DEFAULT_HOST
    const port = nutConfig.port || DEFAULT_PORT
    const dynamicPages = []
    let lockedDynamicPages = []

    const waitCallbacks = []

    function waitUntilValid() {
      const deferred = {}

      deferred.promise = new Promise( ( resolve, reject ) => {
        deferred.resolve = resolve
        deferred.reject = reject
      } )

      waitCallbacks.push( deferred.resolve )

      return deferred.promise
    }

    let devServerOptions = {
      publicPath: webpackConfig.output && webpackConfig.output.publicPath,
      contentBase: false,
      port,
      host,
      hot: true,
      quiet: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      historyApiFallback: true,
      before( app ) {
        app.get( `/_nut_dynamic_build_page`, async ( req, res ) => {
          const page = req.query.page

          if ( !cli.options.dynamic ) {
            return res.json( {
              success: true,
              waitHotApply: false,
            } )
          }

          // prevent waiting for valid
          if ( dynamicPages.includes( page ) ) {
            return res.json( {
              success: true,
              waitHotApply: false,
            } )
          }

          dynamicPages.push( page )

          const modules = await generateModules( await gatherer.getArtifacts(), {
            env: 'dev',
            cliOptions: cli.options,
            dynamicPages,
            lockedDynamicPages,
          } )

          if ( Object.keys( modules ).length > 0 ) {
            for ( const [ path, content ] of Object.entries( modules ) ) {
              virtualModules.writeModule(
                path,
                content
              )
            }

            await waitUntilValid()
          }

          res.json( {
            success: true,
            waitHotApply: true,
          } )
        } )
      },
      after( app ) {
        // rebuild slim routes(without unused HMR code) before following requests
        app.use( async ( req, res, next ) => {
          if ( !cli.options.dynamic ) {
            return next()
          }

          if ( req.path === '/index.html' ) {
            lockedDynamicPages = dynamicPages.slice()

            const modules = await generateModules( await gatherer.getArtifacts(), {
              env: 'dev',
              cliOptions: cli.options,
              dynamicPages,
              // used for generate `module.hot.accept`s, ensure no page refresh
              lockedDynamicPages,
            } )

            if ( Object.keys( modules ).length > 0 ) {
              for ( const [ path, content ] of Object.entries( modules ) ) {
                virtualModules.writeModule(
                  path,
                  content
                )
              }

              await waitUntilValid()
            }
          }

          next()
        } )
      },
    }

    if ( nutConfig.devServer ) {
      // before
      const userDevServerBefore = nutConfig.devServer.before
      const nutDevServerBefore = devServerOptions.before

      if ( userDevServerBefore ) {
        devServerOptions.before = function ( ...args ) {
          userDevServerBefore( ...args )
          nutDevServerBefore( ...args )
        }

        delete nutConfig.devServer.before
      }

      // after
      const userDevServerAfter = nutConfig.devServer.after
      const nutDevServerAfter = devServerOptions.after

      if ( userDevServerAfter ) {
        devServerOptions.after = function ( ...args ) {
          nutDevServerAfter( ...args )
          userDevServerAfter( ...args )
        }

        delete nutConfig.devServer.after
      }

      devServerOptions = Object.assign( devServerOptions, nutConfig.devServer )
    }

    const { compiler } = api.serve( webpackConfig, devServerOptions, () => {
      const routerMode = ( nutConfig.router && nutConfig.router.mode ) || 'hash'

      if ( cli.options.singlePage ) {
        console.log(
          boxen(
            `Your sinlg page is available at${
              getTips( {
                host,
                port,
                routerMode,
                page: cli.options.singlePage
              } )
            }`,
            {
              padding: 1,
              borderColor: 'gray'
            }
          )
        )
      } else {
        console.log(
          boxen(
            `Your application is running at${ getTips( { host, port } ) }`,
            {
              padding: 1,
              borderColor: 'gray'
            }
          )
        )
      }

      console.log( '\n' + chalk.gray( 'Tips: Press "Enter" to open in browser' ) + '\n' )

      // modified from:
      // https://github.com/facebook/jest/blob/b7cb5221bb06b6fe63c1a5e725ddbc1aaa82d306/packages/jest-core/src/watch.ts#L445
      const stdin = process.stdin
      const CONTROL_C = '\u0003'
      const CONTROL_D = '\u0004'
      const ENTER = '\r'

      if ( typeof stdin.setRawMode === 'function' ) {
        stdin.setRawMode( true )
        stdin.resume()
        stdin.setEncoding( 'utf8' )
        stdin.on( 'data', async key => {
          if ( key === CONTROL_C || key === CONTROL_D ) {
            if ( typeof stdin.setRawMode === 'function' ) {
              stdin.setRawMode( false )
            }
            exit( 0 )
            return
          }

          switch ( key ) {
          case ENTER:
            await open( getOpenUrl( {
              host,
              port,
              routerMode,
              page: cli.options.singlePage
            } ) )
            break
          default:
            break
          }
        } )
      }
    } )

    compiler.hooks.done.tap( 'wait-until-valid', () => {
      let callback = waitCallbacks.shift()
      while ( callback ) {
        callback()
        callback = waitCallbacks.shift()
      }
    } )

    function getOpenUrl( { host, port, routerMode = 'hash', page } ) {
      const url = 'http://' + host + ':' + port

      let suffix = ''
      if ( page ) {
        suffix = ( routerMode === 'hash' ? '/#/' : '/' ) + page
      }

      return url + suffix
    }

    function getTips( { host, port, routerMode, page } ) {
      const url = 'http://' + host + ':' + port
      const lanIP = address.ip()
      const lanUrl = lanIP ? `http://${ lanIP }:${ port }` : ''

      let suffix = ''
      if ( page ) {
        suffix = ( routerMode === 'hash' ? '/#/' : '/' ) + page
      }

      const localTips = `\n\nLocal:     ${ chalk.cyan( url + suffix ) }`
      const lanTips = lanUrl ? `\n\nNetwork:   ${ chalk.cyan( lanUrl + suffix ) }` : ''

      return localTips + lanTips
    }

    gatherer.on( 'change', async () => {
      if ( !virtualModules ) {
        return
      }

      try {
        const modules = await generateModules( await gatherer.getArtifacts(), {
          env: 'dev',
          cliOptions: cli.options,
          dynamicPages,
          lockedDynamicPages,
        } )

        for ( const [ path, content ] of Object.entries( modules ) ) {
          virtualModules.writeModule(
            path,
            content
          )
        }
      } catch ( e ) {
        console.log( e )
      }
    } )
  }

  async _prod( driver = {}, nutConfig ) {
    const { api } = driver
    const gatherer = api.gatherer
    const config = api.webpack

    config.plugin( 'define' )
      .tap( args => {
        if ( !args[ 0 ] ) {
          args.push( {} )
        }
        const definitions = args[ 0 ]
        definitions.NUT_CLI_DYNAMIC = JSON.stringify( false )
        return [
          definitions
        ]
      } )

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

    const modules = await generateModules( await gatherer.getArtifacts(), {
      env: 'prod'
    } )

    config.plugin( 'virtual-modules' )
      .use( VirtualModulesPlugin, [ modules ] )
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
