const { Driver } = require( '@nut-project/core' )
const { chain, serve, build, hot, webpack } = require( '@nut-project/webpack' )
const { exposeWebpack, extendWebpack } = require( './webpack' )

const DEFAULTS = {
  host: '127.0.0.1',
  port: 9000
}

class WebpackDriver extends Driver {
  static name() {
    return 'webpack'
  }

  static version() {
    return require( '../package.json' ).version
  }

  hooks() {
    this.addSyncHook( 'cliOptions', [ 'cliOptions' ] )
    this.addSyncHook( 'env', [ 'env' ] )
    this.addSyncHook( 'dangerously_chainWebpack', [ 'config' ] )
    this.addAsyncSeriesHook( 'beforeRun', [] )
    // dev
    this.addSyncWaterfallHook( 'dangerously_modifyServerOptions', [ 'serverOptions' ] )
    this.addAsyncSeriesHook( 'afterServe', [ 'object' ] )
    // build
    this.addAsyncSeriesHook( 'afterBuild', [ 'stats' ] )
  }

  api() {
    this.expose( 'hello' )
    exposeWebpack( { driver: this } )
  }

  apply( cli ) {
    [ 'dev', 'build' ].forEach( command => {
      cli.action( command, async cliOptions => {
        const userConfig = await cli.getConfig()
        await this.compile( command, cli, cliOptions, userConfig )
      } )
    } )
  }

  async compile( command = '', cli, cliOptions = {}, userConfig = {} ) {
    this.callHook( 'cliOptions', cliOptions )

    const COMMAND_TO_ENV = {
      dev: 'development',
      build: 'production',
    }
    const env = COMMAND_TO_ENV[ command ]

    process.env.NODE_ENV = env
    this.callHook( 'env', env )

    const config = chain()

    extendWebpack( config, {
      env,
      cliOptions,
      userConfig,
      cli,
    } )

    this.callHook( 'dangerously_chainWebpack', config )

    const webpackConfig = config.toConfig()

    await this.callHook( 'beforeRun' )

    if ( env === 'development' ) {
      await this.serve( webpackConfig, userConfig )
    } else if ( env === 'production' ) {
      await this.build( webpackConfig, userConfig )
    }
  }

  serve( webpackConfig, userConfig ) {
    const serverOptions = {
      host: userConfig.host || DEFAULTS.host,
      port: userConfig.port || DEFAULTS.port,
      publicPath: webpackConfig.output && webpackConfig.output.publicPath,
      contentBase: false,
      hot: true,
      quiet: true,
      before() {},
      after() {},
    }

    this.callHook( 'dangerously_modifyServerOptions', serverOptions )

    hot( webpackConfig, serverOptions )

    const compiler = webpack( webpackConfig )

    const server = serve( compiler, serverOptions, async () => {
      await this.callHook( 'afterServe', server )
    } )
  }

  async build( webpackConfig ) {
    const stats = await build( webpackConfig )
    await this.callHook( 'afterBuild', stats )
  }
}

module.exports = WebpackDriver
