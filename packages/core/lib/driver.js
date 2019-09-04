const EventEmitter = require( 'events' )
const cosmiconfig = require( 'cosmiconfig' )
const chokidar = require( 'chokidar' )
const logger = require( './logger' )

module.exports = class Driver extends EventEmitter {
  name() {
    return 'nut'
  }

  async _check() {
    const loaded = await this.loadConfig()

    if ( !loaded ) {
      logger.error( 'No config file found' )
      process.exit( 0 )
    }
  }

  async apply() {
    await this._check()

    // watch config file and emit `config:change` event
    // when add / unlink / change
    const loaded = await this.loadConfig()

    const onConfigChange = async () => {
      const loaded = await this.loadConfig()
      if ( loaded ) {
        this.emit( 'config:change', loaded.config )
      } else {
        this.emit( 'config:change', null )
      }
    }

    chokidar
      .watch( [ loaded && loaded.filepath ].filter( Boolean ), {
        ignoreInitial: true,
        persistent: true,
        followSymlinks: false,
        atomic: false,
        alwaysStat: true,
        ignorePermissionErrors: true,
      } )
      .on( 'add', onConfigChange )
      .on( 'unlink', onConfigChange )
      .on( 'change', onConfigChange )
  }

  async loadConfig() {
    const name = this.name()

    if ( !this._explorer ) {
      this._explorer = cosmiconfig( name, { cache: false } )
    }

    let result = null

    try {
      result = await this._explorer.search()
    } catch ( e ) {
      console.log( e )
    }

    return result
  }

  // driver should be responsible for fetch runtime
  getRuntimeURL() {

  }
}
