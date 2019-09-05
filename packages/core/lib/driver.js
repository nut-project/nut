const EventEmitter = require( 'events' )
const cosmiconfig = require( 'cosmiconfig' )
const chokidar = require( 'chokidar' )
const logger = require( './logger' )

module.exports = class Driver extends EventEmitter {
  constructor() {
    super()
    this.check()
  }

  name() {
    return 'nut'
  }

  check() {
    const loaded = this.loadConfigSync()

    if ( !loaded ) {
      logger.error( 'No config file found' )
      process.exit( 0 )
    }
  }

  async watch() {
    // watch config file for add / unlink / change event
    // and emit `config:change` event
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

  loadConfig() {
    return this._loadConfig()
  }

  loadConfigSync() {
    return this._loadConfig( { sync: true } )
  }

  _loadConfig( options = {} ) {
    const sync = options.sync

    const name = this.name()

    if ( !this._explorer ) {
      this._explorer = cosmiconfig( name, { cache: false } )
    }

    if ( sync ) {
      return this._explorer.searchSync()
    }
    return this._explorer.search()
  }

  async getConfig() {
    const loaded = await this.loadConfig()
    return loaded && loaded.config
  }

  // driver should be responsible for fetch runtime
  getRuntimeURL() {

  }
}
