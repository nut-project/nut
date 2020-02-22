const path = require( 'path' )
const exit = require( 'exit' )
const chalk = require( 'chalk' )
const { Driver } = require( '@nut-project/core' )
const { chain, serve, build, webpack, webpackResolve, webpackRequire } = require( '@nut-project/webpack' )
const { logger, detectPort } = require( '@nut-project/dev-utils' )
const { exposeWebpack, extendWebpack, extendDevServer } = require( './webpack' )
const schema = require( './schema' )
const localResolve = require( './webpack/shared/local-resolve' )
const localRequire = require( './webpack/shared/local-require' )
const { override: overrideBabelLoader } = require( './webpack/babel/loader' )

class WebpackDriver extends Driver {
  static id() {
    return 'org.nut.webpack'
  }

  static name() {
    return 'webpack'
  }

  static version() {
    return require( '../package.json' ).version
  }

  static schema( { struct } ) {
    return schema( { struct } )
  }

  hooks() {
    this.addAsyncSeriesHook( 'forceExit', [] )
    this.addSyncHook( 'stdin', [ 'key' ] )
    this.addSyncHook( 'compilerDone', [] )
    this.addSyncHook( 'compilerError', [] )
    this.addSyncHook( 'cliOptions', [ 'cliOptions' ] )
    this.addSyncHook( 'userConfig', [ 'userConfig' ] )
    this.addSyncHook( 'env', [ 'env' ] )
    this.addSyncHook( 'dangerously_webpackChainFactory', [ 'factory' ] )
    this.addSyncHook( 'dangerously_chainWebpack', [ 'config', 'options' ] )
    this.addSyncHook( 'dangerously_chainedWebpack', [ 'config' ] )
    this.addSyncHook( 'compiler', [ 'compiler' ] )
    this.addAsyncSeriesHook( 'beforeRun', [] )

    // dev
    this.addSyncHook( 'dangerously_serverOptions', [ 'serverOptions' ] )
    this.addSyncHook( 'beforeMiddlewares', [ 'object' ] )
    this.addSyncHook( 'afterMiddlewares', [ 'object' ] )
    this.addAsyncSeriesHook( 'afterServe', [ 'object' ] )

    // build
    this.addAsyncSeriesHook( 'afterBuild', [ 'stats' ] )
  }

  api() {
    exposeWebpack( this )

    // middlewares
    this.expose( 'middlewares', {
      prepend: middleware => {
        this.useHook( 'beforeMiddlewares', ( { app } ) => {
          app.use( middleware )
        } )
      },

      append: middleware => {
        this.useHook( 'afterMiddlewares', ( { app } ) => {
          app.use( middleware )
        } )
      }
    } )

    this.expose( 'dangerously_webpack', webpack )
    // resolve file in webpack directory
    this.expose( 'dangerously_webpackResolve', webpackResolve )
    this.expose( 'dangerously_webpackRequire', webpackRequire )
    // resolve module in driver node_modules
    this.expose( 'dangerously_resolve', id => require.resolve( id ) )
    this.expose( 'dangerously_require', id => require( id ) )
    // resolve file in user project node_modules
    this.expose( 'localResolve', localResolve )
    this.expose( 'localRequire', localRequire )
  }

  apply( cli ) {
    [ 'dev', 'build' ].forEach( command => {
      cli.action( command, async cliOptions => {
        await this.flow( command, cliOptions )
      } )
    } )
  }

  createWebpackChain( options, extraOptions = {} ) {
    const config = chain()

    extendWebpack( config, options )

    this.callHook( 'dangerously_chainWebpack', config, extraOptions )

    return config
  }

  async flow( command = '', cliOptions = {} ) {
    const warnings = []
    let pkg = {}

    try {
      pkg = require( path.join( process.cwd(), 'package.json' ) )
    } catch ( e ) {} // eslint-disable-line

    const COMMAND_TO_ENV = {
      dev: 'development',
      build: 'production',
    }
    const env = COMMAND_TO_ENV[ command ]

    if ( env === 'development' ) {
      this.listenStdin()
    }

    process.env.NODE_ENV = env
    this.callHook( 'env', env )

    this.callHook( 'cliOptions', cliOptions )

    const userConfig = ( await this.getConfig() ) || {}

    this.callHook( 'userConfig', userConfig )

    // custom babel-loader
    this.customBabel()

    const config = this.createWebpackChain( {
      env,
      cliOptions,
      userConfig,
      pkg,
      driver: this,
    } )

    this.callHook( 'dangerously_webpackChainFactory', this.createWebpackChain.bind( this, {
      env,
      cliOptions,
      userConfig,
      pkg,
      driver: this,
    } ) )

    // access fullly chained config here
    this.callHook( 'dangerously_chainedWebpack', config )

    const webpackConfig = config.toConfig()

    if ( env === 'development' ) {
      const devServerConfig = userConfig.devServer || {}

      const defaultServerOptions = {
        host: '127.0.0.1',
        port: 9000,
        proxy: {}
      }

      const serverOptions = {
        host: devServerConfig.host || defaultServerOptions.host,
        port: devServerConfig.port || defaultServerOptions.port,
        publicPath: webpackConfig.output && webpackConfig.output.publicPath,
        contentBase: false,
        hot: true,
        quiet: false,
        proxy: devServerConfig.proxy || defaultServerOptions.proxy,
        before: ( app, server, compiler ) => {
          this.callHook( 'beforeMiddlewares', {
            app,
            server,
            compiler,
          } )
        },
        after: ( app, server, compiler ) => {
          this.callHook( 'afterMiddlewares', {
            app,
            server,
            compiler,
          } )
        },
      }

      extendDevServer( serverOptions, {
        env,
        cliOptions,
        userConfig,
        pkg,
        driver: this,
      } )

      const _port = await detectPort( serverOptions.port )

      if ( _port !== serverOptions.port ) {
        warnings.push(
          `Port ${ serverOptions.port } is occupied, use another port ${ chalk.magenta( _port ) }\n`
        )
        serverOptions.port = _port
      }

      this.callHook( 'dangerously_serverOptions', serverOptions )

      const compiler = webpack( webpackConfig )

      this.callHook( 'compiler', compiler )

      this.listenCompilerDone( compiler )

      if ( warnings.length > 0 ) {
        warnings.forEach( warning => {
          logger.warn( warning )
          console.log()
        } )
      }

      await this.callHook( 'beforeRun' )

      await this.serve( compiler, serverOptions )
    } else if ( env === 'production' ) {
      const compiler = webpack( webpackConfig )

      this.callHook( 'compiler', compiler )

      this.listenCompilerDone( compiler )

      await this.callHook( 'beforeRun' )

      await this.build( compiler )
    }
  }

  customBabel() {
    overrideBabelLoader( babel => {
      const defaultPreset = babel.createConfigItem(
        require.resolve( './webpack/babel/preset' ),
        { type: 'preset' }
      )

      return {
        customOptions( { isModern = false, ...loader } = {} ) {
          if ( loader.cacheDirectory && isModern ) {
            // maybe unnecessary to add `-modern` suffix
            // as babel partial config is different internally
            // and modern build is only enabled in production mode
            // cache is only enabled in development mode
            loader.cacheIdentifier = loader.cacheIdentifier + '-modern'
          }

          return {
            custom: { isModern },
            loader,
          }
        },

        config( cfg, { customOptions = {} } = {} ) {
          const { isModern } = customOptions
          const options = Object.assign( {}, cfg.options )

          options.caller.isModern = isModern

          if ( cfg.hasFilesystemConfig() ) {
            // TODO: check whether contains preset in modern build plugin
            return options
          }

          return {
            ...options,
            presets: [ ...( options.presets || [] ), defaultPreset ]
          }
        }
      }
    } )
  }

  listenCompilerDone( compiler ) {
    compiler.hooks.done.tap( 'driver-webpack', stats => {
      if ( stats.hasErrors() ) {
        this.callHook( 'compilerError' )
      } else {
        this.callHook( 'compilerDone' )
      }
    } )
  }

  serve( compiler, serverOptions ) {
    const server = serve( compiler, serverOptions, async () => {
      await this.callHook( 'afterServe', server )
    } )
  }

  async build( compiler ) {
    const stats = await build( compiler )
    await this.callHook( 'afterBuild', stats )
  }

  listenStdin() {
    // modified from:
    // https://github.com/facebook/jest/blob/b7cb5221bb06b6fe63c1a5e725ddbc1aaa82d306/packages/jest-core/src/watch.ts#L445
    const stdin = process.stdin
    if ( typeof stdin.setRawMode === 'function' ) {
      stdin.setRawMode( true )
      stdin.resume()
      stdin.setEncoding( 'utf8' )
      stdin.on( 'data', async key => {
        this.callHook( 'stdin', key )

        const CONTROL_C = '\u0003'
        const CONTROL_D = '\u0004'

        if ( key === CONTROL_C || key === CONTROL_D ) {
          if ( typeof stdin.setRawMode === 'function' ) {
            stdin.setRawMode( false )
          }

          await this.callHook( 'forceExit' )

          exit( 0 )
        }
      } )
    }
  }
}

module.exports = WebpackDriver
