const prettyBytes = require( 'pretty-bytes' )
const resolveFrom = require( 'resolve-from' )
const importFresh = require( 'import-fresh' )
const chokidar = require( 'chokidar' )
const readline = require( 'readline' )
const tildify = require( 'tildify' )
const chalk = require( 'chalk' )
const path = require( 'path' )
const exit = require( 'exit' )
const whyIsNodeRunning = require( 'why-is-node-running' )
const { config, logger } = require( '@nut-project/core' )
const detectPort = require( 'detect-port' )
const install = require( 'install-packages' )
const openBrowser = require( './dev-utils/open-browser.js' )
const {
  chain, serve, build, webpack, WebpackDevServer
} = require( '@nut-project/webpack' )
const {
  SyncHook, SyncWaterfallHook, AsyncSeriesHook, AsyncSeriesWaterfallHook
} = require( 'tapable' )
const getPages = require( './get-pages' )

class PagesDriver {
  constructor( options ) {
    this.options = options
    this.logger = logger.scope( this.scope )
    this.configManager = config( this.scope )
    this.colors = chalk
    this._exposed = {}
    this.resetHooks()
  }

  async install( packages = [], options = {} ) {
    return await install( {
      packages,
      ...options
    } )
  }

  openBrowser( url ) {
    return openBrowser( url )
  }

  async getPages( context ) {
    return await getPages( context )
  }

  async checkConfigExists() {
    return await this.configManager.check()
  }

  async getConfig() {
    const config = ( await this.configManager.get() ) || {}

    const plugins = await this.normalizePlugins( config.plugins || [] )

    // normalize user plugins
    config.plugins = plugins
    config.corePlugins = plugins.filter( plugin => plugin.core === true )
    config.userPlugins = plugins.filter( plugin => plugin.core !== true )

    await this.hooks.getConfig.promise( config )

    this._config = config

    return config
  }

  async getConfigFile() {
    return await this.configManager.getFile()
  }

  // types: add / unlink / change
  async watch( files, types, callback ) {
    // watch files
    const watchOptions = {
      ignoreInitial: true,
      persistent: true,
      followSymlinks: false,
      atomic: false,
      alwaysStat: true,
      ignorePermissionErrors: true,
    }

    const watcher = chokidar
      .watch( files, watchOptions )

    types.forEach( type => {
      watcher.on( type, callback )
    } )
  }

  async applyPlugins( plugins ) {
    for ( const plugin of plugins ) {
      await this.applyPlugin( plugin )
    }
  }

  async normalizePlugins( plugins ) {
    return plugins
      .map( plugin => {
        let pluginPath = plugin
        let pluginOptions = {}

        if ( Array.isArray( plugin ) ) {
          [ pluginPath, pluginOptions ] = plugin
        }

        const pkgPath = resolveFrom.silent( pluginPath, './package.json' )

        try {
          return {
            ...importFresh( pluginPath ),
            context: path.dirname( pkgPath || pluginPath ),
            options: pluginOptions,
          }
        } catch ( e ) {
          this.logger.error( `Invalid plugin found ${ this.colors.dim( '(' + tildify( pluginPath ) + ')' ) }\n` )
          console.log( chalk.dim( e.stack ) )
          console.log()
          this.exit()
        }

        return false
      } )
      .filter( Boolean )
      // core plugins should be at first
      .sort( ( a, b ) => {
        return Boolean( b.core ) - Boolean( a.core )
      } )
  }

  async applyPlugin( plugin ) {
    try {
      if ( plugin.core ) {
        this.expose = ( name, method ) => {
          this._exposed[ name ] = method
        }
      } else {
        this.expose = () => {
          this.logger.error( `[${ plugin.name }] expose is only available in core plugin` )
        }
      }

      // for proxy exposed methods
      const api = new Proxy( this, {
        get( target, name ) {
          const value = target[ name ]
          if ( typeof value !== 'undefined' ) {
            if (
              typeof value === 'function' &&
              typeof target[ name ].bind === 'function'
            ) {
              return target[ name ].bind( target )
            }

            return target[ name ]
          }

          const exposed = target._exposed && target._exposed[ name ]
          if ( typeof exposed !== 'undefined' ) {
            if (
              typeof exposed === 'function' &&
              typeof exposed.bind === 'function'
            ) {
              const context = Object.assign( target, {
                caller: plugin
              } )
              return exposed.bind( context )
            }

            return target._exposed[ name ]
          }
        }
      } )

      await plugin.apply( api, plugin.options )
      if ( this.verbose ) {
        this.logger.success( `applied ${ plugin.core ? 'core ' : '' }plugin: ${ chalk.green( plugin.name ) }\n` )
      }
    } catch ( e ) {
      this.logger.error( `apply ${ plugin.core ? 'core ' : '' }plugin failed: ${ chalk.red( plugin.name ) }\n` )
      console.log( chalk.dim( e.stack ) )
      console.log()
    }
  }

  async apply() {
    const { cli } = this

    await this.getConfig()

    if ( await this.getConfigFile() ) {
      this.verbose = this.config.verbose === true
    } else {
      this.verbose = false
    }

    // core plugins can access every hook, but there is no env for them
    // if you want access env, consider use beforeRun hook
    await this.applyPlugins( this.config.corePlugins )

    const commands = {
      dev: cli.command( 'dev', 'Build in development mode' ).allowUnknownOptions(),
      build: cli.command( 'build', 'Build in production mode' ).allowUnknownOptions(),
    }

    Object.keys( commands )
      .forEach( name => {
        commands[ name ].action( async cliOptions => {
          this.start = async () => {
            let env = this._mapCommandToEnv( name )

            env = await this.hooks.env.promise( env )

            this._env = env
            this._cliOptions = cliOptions
            process.env.NODE_ENV = env

            if ( env === 'development' ) {
              this._listenForStdin()
            }

            // reload config
            await this.getConfig()

            // apply user plugins after env has been set
            await this.hooks.beforeUserPlugins.promise( this.config.userPlugins )
            await this.applyPlugins( this.config.userPlugins )
            await this.hooks.afterUserPlugins.promise()

            await this.hooks.beforeRun.promise()

            await this.run()
          }

          await this.start()
        } )
      } )

    this.hooks.registerCommands.call( cli )

    cli.on( 'command:*', () => {
      this.logger.error( 'Invalid command: ' + cli.args.join( ' ' ) )
      console.log()
    } )
  }

  _listenForStdin() {
    // modified from:
    // https://github.com/facebook/jest/blob/b7cb5221bb06b6fe63c1a5e725ddbc1aaa82d306/packages/jest-core/src/watch.ts#L445
    const stdin = process.stdin
    if ( typeof stdin.setRawMode === 'function' ) {
      stdin.setRawMode( true )
      stdin.resume()
      stdin.setEncoding( 'utf8' )
      stdin.on( 'data', async key => {
        const CONTROL_C = '\u0003'
        const CONTROL_D = '\u0004'

        if ( key === CONTROL_C || key === CONTROL_D ) {
          if ( typeof stdin.setRawMode === 'function' ) {
            stdin.setRawMode( false )
          }
          exit( 0 )
          return
        }

        await this.hooks.stdin.promise( key )
      } )
    }
  }

  _mapCommandToEnv( name ) {
    const map = {
      dev: 'development',
      build: 'production',
    }
    return map[ name ] || 'development'
  }

  resetHooks() {
    this.hooks = {
      stdin: new AsyncSeriesHook( [ 'key' ] ),
      env: new AsyncSeriesWaterfallHook( [ 'env' ] ),
      chainWebpack: new AsyncSeriesHook( [ 'config' ] ),
      emitRoutes: new AsyncSeriesHook( [ 'routes' ] ),
      registerCommands: new SyncHook( [ 'cli' ] ),
      getConfig: new AsyncSeriesWaterfallHook( [ 'config' ] ),
      beforeUserPlugins: new AsyncSeriesWaterfallHook( [ 'plugins' ] ),
      beforeRun: new AsyncSeriesHook(),
      afterClearConsole: new AsyncSeriesHook(),
      toConfig: new AsyncSeriesHook(),
      afterUserPlugins: new AsyncSeriesHook(),
      afterBuild: new AsyncSeriesHook( [ 'error', 'stats' ] ),
      compiler: new SyncHook( [ 'compiler' ] ),
      serverOptions: new SyncWaterfallHook( [ 'serverOptions' ] ),
      server: new SyncHook( [ 'server' ] ),
      afterServe: new SyncHook( [ 'compiler', 'server' ] ),
      beforeExit: new AsyncSeriesHook(),
      restart: new AsyncSeriesHook(),
    }
  }

  async run() {
    const { env } = this

    await this.hooks.chainWebpack.promise( this.webpack )

    const webpackConfig = this.webpack.toConfig()

    await this.hooks.toConfig.promise( webpackConfig )

    if ( env === 'development' ) {
      let serverOptions = {
        host: this.config.host || '127.0.0.1',
        port: this.config.port || '9000',
        publicPath: webpackConfig.output && webpackConfig.output.publicPath,
        contentBase: false,
        hot: true,
        quiet: true,
        before() {},
        after() {},
      }

      const _port = await detectPort( serverOptions.port )

      if ( _port !== serverOptions.port ) {
        const oldPort = serverOptions.port
        serverOptions.port = _port
        this.hooks.afterClearConsole.tapPromise( 'builtin:driver', async () => {
          this.logger.warn( `Port ${ oldPort } is occupied, use another port ${ this.colors.magenta( _port ) }\n` )
        } )
      }

      serverOptions = await this.hooks.serverOptions.promise( serverOptions )

      // add hmr feature
      WebpackDevServer.addDevServerEntrypoints( webpackConfig, serverOptions )

      const compiler = webpack( webpackConfig )

      this.hooks.compiler.call( compiler )

      compiler.hooks.done.tap( 'memory-usage', () => {
        const { heapUsed } = process.memoryUsage()
        console.log( chalk.gray( `\n${ prettyBytes( heapUsed ) } Memory Used\n` ) )
      } )

      this.clearConsole()

      await this.hooks.afterClearConsole.promise()

      const server = serve( compiler, serverOptions, async () => {
        await this.hooks.afterServe.promise( compiler, server )
      } )

      this._server = server

      await this.hooks.server.promise( server )
    } else {
      try {
        const stats = await build( webpackConfig )
        await this.hooks.afterBuild.promise( null, stats )
      } catch ( e ) {
        await this.hooks.afterBuild.promise( e )
      }

      if ( this.cliOptions.whyIsNodeRunning ) {
        try {
          whyIsNodeRunning()
        } catch ( e ) {}
      }
    }
  }

  // from friendly-errors-webpack-plugin
  clearConsole() {
    if ( process.stdout.isTTY ) {
      const blank = '\n'.repeat( process.stdout.rows )
      console.log( blank )
      readline.cursorTo( process.stdout, 0, 0 )
      readline.clearScreenDown( process.stdout )
    }
  }

  delay( duration = 0 ) {
    return new Promise( resolve => setTimeout( resolve, duration ) )
  }

  async exit() {
    await this.hooks.beforeExit.promise()
    exit( 0 )
  }

  async restart() {
    await this.hooks.restart.promise()

    if ( !this.server ) {
      return
    }

    this.server.close( async () => {
      this.clearConsole()

      await this.delay( 500 )

      // reset
      this.resetHooks()
      this._webpack = null

      await this.getConfig()
      this.verbose = false

      await this.applyPlugins( this.config.corePlugins )

      if ( this.start ) {
        await this.start()
      }
    } )
  }

  chain() {
    if ( !this._webpack ) {
      this._webpack = chain()
    }

    return this._webpack
  }

  get server() {
    return this._server
  }

  get env() {
    return this._env
  }

  get scope() {
    return this.options.scope
  }

  get cli() {
    return this.options.cli
  }

  get cliOptions() {
    return this._cliOptions
  }

  get config() {
    return this._config
  }

  get webpack() {
    return this.chain()
  }
}

module.exports = PagesDriver
