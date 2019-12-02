const path = require( 'path' )
const exit = require( 'exit' )
const chalk = require( 'chalk' )
const { Driver } = require( '@nut-project/core' )
const { chain, serve, build, hot, webpack } = require( '@nut-project/webpack' )
const { logger, detectPort } = require( '@nut-project/dev-utils' )
const { exposeWebpack, extendWebpack, extendDevServer } = require( './webpack' )

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

  hooks() {
    this.addAsyncSeriesHook( 'forceExit', [] )
    this.addSyncHook( 'stdin', [ 'key' ] )
    this.addSyncHook( 'compilerDone', [] )
    this.addSyncHook( 'cliOptions', [ 'cliOptions' ] )
    this.addSyncHook( 'userConfig', [ 'userConfig' ] )
    this.addSyncHook( 'env', [ 'env' ] )
    this.addSyncHook( 'dangerously_chainWebpack', [ 'config' ] )
    this.addSyncHook( 'compiler', [ 'compiler' ] )
    this.addAsyncSeriesHook( 'beforeRun', [] )

    // dev
    this.addSyncHook( 'dangerously_serverOptions', [ 'serverOptions' ] )
    this.addAsyncSeriesHook( 'afterServe', [ 'object' ] )

    // build
    this.addAsyncSeriesHook( 'afterBuild', [ 'stats' ] )
  }

  api() {
    exposeWebpack( this )
  }

  apply( cli ) {
    [ 'dev', 'build' ].forEach( command => {
      cli.action( command, async cliOptions => {
        await this.flow( command, cli, cliOptions )
      } )
    } )
  }

  async flow( command = '', cli, cliOptions = {} ) {
    let pkg = {}

    try {
      pkg = require( path.join( process.cwd(), 'package.json' ) )
    } catch {}

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

    const userConfig = await cli.getConfig()

    this.callHook( 'userConfig', userConfig )

    const config = chain()

    extendWebpack( config, {
      env,
      cliOptions,
      userConfig,
      pkg,
      cli,
    } )

    this.callHook( 'dangerously_chainWebpack', config )

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
        before() {},
        after() {},
      }

      extendDevServer( serverOptions, {
        env,
        cliOptions,
        userConfig,
        pkg,
        cli,
      } )

      const _port = await detectPort( serverOptions.port )

      const warnings = []
      if ( _port !== serverOptions.port ) {
        warnings.push(
          `Port ${ serverOptions.port } is occupied, use another port ${ chalk.magenta( _port ) }\n`
        )
        serverOptions.port = _port
      }

      this.callHook( 'dangerously_serverOptions', serverOptions )

      hot( webpackConfig, serverOptions )

      const compiler = webpack( webpackConfig )

      this.callHook( 'compiler', compiler )

      this.listenCompilerDone( compiler )

      await this.callHook( 'beforeRun' )

      if ( warnings.length > 0 ) {
        logger.warn( warnings[ 0 ] )
      }

      await this.serve( compiler, serverOptions )
    } else if ( env === 'production' ) {
      const compiler = webpack( webpackConfig )

      this.callHook( 'compiler', compiler )

      this.listenCompilerDone( compiler )

      await this.callHook( 'beforeRun' )

      await this.build( compiler )
    }
  }

  listenCompilerDone( compiler ) {
    compiler.hooks.done.tap( 'driver-webpack', () => {
      this.callHook( 'compilerDone' )
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
