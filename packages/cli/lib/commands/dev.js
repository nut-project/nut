const path = require( 'path' )
const chokidar = require( 'chokidar' )
const boxen = require( 'boxen' )
const chalk = require( 'chalk' )
const read = require( 'read' )
const open = require( 'open' )
const address = require( 'address' )
const prettyBytes = require( 'pretty-bytes' )
const webpackMerge = require( 'webpack-merge' )
const webpack = require( 'webpack' )
const WebpackDevServer = require( 'webpack-dev-server' )
const VirtualModulesPlugin = require( 'webpack-virtual-modules' )
const CaseSensitivePathsPlugin = require( 'case-sensitive-paths-webpack-plugin' )
const history = require( 'connect-history-api-fallback' )

const createBaseWebpackConfig = require( '../webpack/create-base-config' )
const applyCSSRules = require( '../webpack/apply-css-rules' )
const generateVirtualModules = require( '../utils/generate-virtual-modules' )
const loadConfig = require( '../utils/load-config' )
const ensureConfigDefaults = require( '../utils/ensure-config-defaults' )
const getAppId = require( '../utils/get-app-id' )
const { normal, child } = require( '../webpack/extend-webpack' )

const DEFAULT_HOST = '0.0.0.0'
const DEFAULT_PORT = 9000

const dirs = {
  cli: path.join( __dirname, '../../' ),
  project: process.cwd(),
}

async function dev( cliOptions = {} ) {
  process.env.NODE_ENV = 'development'

  let result = await loadConfig()
  let nutConfig = result.config || {}

  ensureConfigDefaults( nutConfig )

  const host = nutConfig.host || DEFAULT_HOST
  const port = nutConfig.port || DEFAULT_PORT

  const dynamicPages = []

  const modules = await generateVirtualModules( nutConfig, {
    env: 'dev',
    cliOptions,
    dynamicPages,
  } )

  let virtualModules

  const appId = getAppId()
  const webpackConfig = createBaseWebpackConfig( nutConfig, appId )
  normal( webpackConfig, nutConfig )
  child( webpackConfig, nutConfig, appId )

  webpackConfig.mode( 'development' )
  webpackConfig.devtool( 'cheap-module-source-map' )
  webpackConfig.output
    .filename( '[name].[hash:16].js' )
  webpackConfig
    .plugin( 'hot' )
      .use( webpack.HotModuleReplacementPlugin ) // eslint-disable-line
  webpackConfig.plugin( 'case-sensitive-paths' )
    .use( CaseSensitivePathsPlugin )
  webpackConfig.plugin( 'virtual-modules' )
    .init( ( Plugin, args ) => {
      virtualModules = new Plugin( ...args )
      return virtualModules
    } )
    .use( VirtualModulesPlugin, [ modules ] )
  webpackConfig.plugin( 'define' )
    .use( webpack.DefinePlugin, [
      {
        NUT_CLI_DYNAMIC: JSON.stringify( Boolean( cliOptions.dynamic ) )
      }
    ] )
  if ( cliOptions.dynamic ) {
    webpackConfig.optimization
      .splitChunks( {
        chunks: 'initial'
      } )
  }

  applyCSSRules( webpackConfig, 'dev', appId )

  if ( typeof nutConfig.chainWebpack === 'function' ) {
    nutConfig.chainWebpack( webpackConfig )
  }

  let finalWebpackConfig = webpackConfig.toConfig()

  // webpack configuration is ready to go
  if ( typeof nutConfig.configureWebpack === 'function' ) {
    nutConfig.configureWebpack( finalWebpackConfig )
  } else if ( typeof nutConfig.configureWebpack === 'object' ) {
    finalWebpackConfig = webpackMerge.smart(
      finalWebpackConfig,
      nutConfig.configureWebpack
    )
  }

  const compiler = webpack( finalWebpackConfig )

  compiler.hooks.done.tap( 'memory-usage', () => {
    const { heapUsed } = process.memoryUsage()
    console.log( chalk.gray( `\n${ prettyBytes( heapUsed ) } Memory Used\n` ) )
  } )

  const waitCallbacks = []
  compiler.hooks.done.tap( 'wait-until-valid', () => {
    let callback = waitCallbacks.shift()
    while ( callback ) {
      callback()
      callback = waitCallbacks.shift()
    }
  } )

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
    contentBase: './dist',
    host,
    hot: true,
    quiet: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    historyApiFallback: false,
    before( app ) {
      app.get( `/_nut_dynamic_build_page`, async ( req, res ) => {
        const page = req.query.page

        if ( !cliOptions.dynamic ) {
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

        const modules = await generateVirtualModules( nutConfig, {
          env: 'dev',
          cliOptions,
          dynamicPages,
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

      app.use( history() )

      // rebuild slim routes(without unused HMR code) before following requests
      app.use( async ( req, res, next ) => {
        if ( req.path === '/index.html' ) {
          const modules = await generateVirtualModules( nutConfig, {
            env: 'dev',
            cliOptions,
            dynamicPages,
            slimRoutesHMR: true,
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
    const userDevServerBefore = nutConfig.devServer.before
    const nutDevServerBefore = devServerOptions.before

    if ( userDevServerBefore ) {
      devServerOptions.before = function ( ...args ) {
        nutDevServerBefore( ...args )
        return userDevServerBefore( ...args )
      }

      delete nutConfig.devServer.before
    }
    devServerOptions = Object.assign( devServerOptions, nutConfig.devServer )
  }

  WebpackDevServer.addDevServerEntrypoints( finalWebpackConfig, devServerOptions )
  const server = new WebpackDevServer( compiler, devServerOptions )

  server.listen( port, host, () => {
    const routerMode = ( nutConfig.router && nutConfig.router.mode ) || 'hash'

    if ( cliOptions.singlePage ) {
      console.log(
        boxen(
          `Your sinlg page is available at${
            getTips( {
              host,
              port,
              routerMode,
              page: cliOptions.singlePage
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

    console.log( '\n' + chalk.gray( 'Tips: Press "Enter" to open' ) + '\n' )

    read( {
      silent: true,
    }, async ( err, input ) => {
      if ( err ) {
        process.exit( 0 )
        return
      }

      if ( input === '' ) {
        await open( getOpenUrl( {
          host,
          port,
          routerMode,
          page: cliOptions.singlePage
        } ) )
      }
    } )
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

  const onFileChange = async () => {
    if ( !virtualModules ) {
      return
    }

    try {
      result = await loadConfig()
      nutConfig = result.config

      const modules = await generateVirtualModules( nutConfig, {
        env: 'dev',
        cliOptions,
        dynamicPages,
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
  }

  const appFiles = [
    path.join( dirs.project, 'src/app.js' ),
    path.join( dirs.project, 'src/app.ts' ),
  ]

  chokidar
    .watch( [
      result.filepath,
      ...appFiles,
    ], {
      ignoreInitial: true,
    } )
    .on( 'change', onFileChange )

  chokidar
    .watch( [
      path.join( dirs.project, 'src/pages' ),
    ], {
      ignoreInitial: true,
    } )
    .on( 'add', onFileChange )
    .on( 'unlink', onFileChange )
}

module.exports = dev
