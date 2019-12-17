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
    this.addAsyncSeriesWaterfallHook( 'fetchSchemaScenes', [ 'id' ] )
    this.addAsyncSeriesWaterfallHook( 'fetchSceneMockData', [ 'requestDetail' ] )
    this.addAsyncSeriesWaterfallHook( 'notfound', [ 'requestDetail' ] )
    this.addAsyncSeriesHook( 'afterServe', [ 'server' ] )
  }

  api() {
  }

  apply( cli ) {
    [ '' ].forEach( command => {
      cli.action( command, () => {
        this.run( cli )
      } )
    } )
  }

  async run( cli ) {
    const { config: userConfig } = ( await cli.getConfig() ) || {}

    this.callHook( 'beforeRun' )
    serve( this, { userConfig } )
  }
}
module.exports = MockDriver
