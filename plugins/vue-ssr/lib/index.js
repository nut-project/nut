const { createBundleRenderer } = require( 'vue-server-renderer' )
const VueSSRClientWebpackPlugin = require( 'vue-server-renderer/client-plugin' )
const VueSSRServerWebpackPlugin = require( 'vue-server-renderer/server-plugin' )
const nodeExternals = require( 'webpack-node-externals' )
const path = require( 'path' )
const fs = require( 'fs' )
const removeMagicHtml = require( './remove-magic-html' )

class VueSSRPlugin {
  constructor( options = {} ) {
    this._options = options
  }

  apply( ctx ) {
    const { entry, html = '' } = this._options
    const { api, hook } = ctx.use( 'webpack' )
    const webpack = api.dangerously_webpack

    let clientManifest
    let serverBundle
    let renderer

    api.middlewares.append( function ssr( req, res, next ) {
      if ( !renderer ) {
        console.log( 'Bundling not finished' )
        return next()
      }

      renderer.renderToString( { url: req.path }, ( err, rendered ) => {
        if ( err ) {
          console.log( 'renderToString error:', err )
          return next()
        }

        res.set( 'Content-Type', 'text/html' )
        res.send( Buffer.from( rendered ) )
        res.end()
      } )
    } )

    function notify() {
      if ( clientManifest && serverBundle ) {
        renderer = createBundleRenderer( serverBundle, {
          runInNewContext: false,
          template: html,
          clientManifest,
          inject: false,
        } )
      }
    }

    hook( 'dangerously_chainWebpack', ( config, options ) => {
      if ( options && options.type === 'server' ) {
        return
      }

      // only process client config here
      config.plugin( 'define' )
        .tap( ( [ options ] ) => {
          options[ 'process.env.VUE_ENV' ] = 'client'
          return [ options ]
        } )

      config.plugin( 'vue-ssr-client' )
        .use( VueSSRClientWebpackPlugin )

      config.plugin( 'html' )
        .tap( ( [ options ] ) => {
          options.filename = 'index.csr.html'
          return [ options ]
        } )
    } )

    hook( 'env', env => {
      hook( 'dangerously_webpackChainFactory', factory => {
        // config from base and plugins
        let config = factory( { type: 'server' } )
        let compiler

        if ( env === 'development' ) {
          hook( 'beforeRun', async () => {
            config = ssrify( config, entry )
            compiler = webpack( config.toConfig() )

            const mfs = new webpack.MemoryOutputFileSystem()

            compiler.outputFileSystem = mfs

            compiler.watch( {}, err => {
              if ( err ) {
                console.error( err )
              }

              serverBundle = JSON.parse(
                mfs.readFileSync(
                  path.join( compiler.options.output.path, 'vue-ssr-server-bundle.json' ),
                  'utf8'
                )
              )

              notify()
            } )
          } )
        } else {
          hook( 'beforeRun', async () => {
            config = ssrify( config, entry )
            compiler = webpack( config.toConfig() )

            // must compile after client bundle(maybe cleaned by client compiler)
            hook( 'compilerDone', () => {
              compiler.run( () => {
                fs.writeFileSync(
                  path.join( compiler.options.output.path, 'index.ssr.html' ),
                  html,
                  'utf8'
                )
              } )
            } )
          } )
        }
      } )

      if ( env === 'development' ) {
        hook( 'compiler', compiler => {
          hook( 'compilerDone', () => {
            clientManifest = JSON.parse(
              compiler.outputFileSystem.readFileSync(
                path.join( compiler.options.output.path, 'vue-ssr-client-manifest.json' ),
                'utf8'
              )
            )

            notify()
          } )
        } )

        hook( 'dangerously_serverOptions', serverOptions => {
          // disable historyApiFallback
          serverOptions.historyApiFallback = false
          removeMagicHtml( serverOptions )
          console.log( serverOptions.features )
        } )
      }
    } )
  }
}

function ssrify( config, entry ) {
  if ( config.plugins.has( 'webpackbar' ) ) {
    config.plugin( 'webpackbar' ).tap( ( [ options ] ) => {
      options.name = 'server'
      options.color = 'blue'
      return [ options ]
    } )
  }

  if ( entry ) {
    config.entry( 'index' ).clear()
    config.entry( 'index' ).add( entry )
  }

  config.target( 'node' )
  config.devtool( 'source-map' )
  config.output.libraryTarget( 'commonjs2' )
  config.optimization.runtimeChunk( false )
  config.optimization.splitChunks( false )

  config.externals( nodeExternals() )

  config.plugin( 'vue-ssr-server' )
    .use( VueSSRServerWebpackPlugin )

  config.plugin( 'define' )
    .tap( ( [ options ] ) => {
      options[ 'process.env.VUE_ENV' ] = 'server'
      return [ options ]
    } )

  // will cause bug
  ;[ 'scss', 'stylus', 'css', 'less', 'mcss', 'css' ]
    .forEach( lang => {
      if ( !config.module.rules.has( lang ) ) {
        return
      }

      config.module.rule( lang ).oneOfs.clear()

      config.module.rule( lang )
        .use( 'null' )
        .loader( require.resolve( 'null-loader' ) )
    } )

  config
    .plugins
    .delete( 'extract-css' )
    .delete( 'html' )
    .delete( 'html-inline-chunk' )
    .delete( 'html-cheerio' )
    .delete( 'clean' )

  return config
}

module.exports = VueSSRPlugin
