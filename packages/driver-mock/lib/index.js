const { Driver } = require( '@nut-project/core' )
const { serve } = require( './proxy/serve' )

class MockDriver extends Driver {
  static name() {
    return 'mock'
  }

  static version() {
    return require( '../package.json' ).version
  }

  hooks() {
    this.addSyncHook( 'beforeRun', [ ] )
    this.addAsyncSeriesWaterfallHook( 'fetchSchemas', [ 'config' ] )
    this.addAsyncSeriesWaterfallHook( 'fetchScenes', [ 'id' ] )
    this.addAsyncSeriesWaterfallHook( 'notfound', [ 'requestDetail' ] )
    this.addAsyncSeriesHook( 'afterServe', [ 'server' ] )
  }

  api() {
  }

  apply( cli ) {
    [ 'dev' ].forEach( command => {
      cli.action( command, () => {
        this.run( cli )
      } )
    } )
  }

  async run( cli ) {
    const userConfig = await cli.getConfig()

    this.callHook( 'beforeRun' )
    serve( this, { userConfig } )
  }
}
module.exports = MockDriver
