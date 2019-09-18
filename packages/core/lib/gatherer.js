const cosmiconfig = require( 'cosmiconfig' )
const logger = require( './logger' )

class Gatherer {
  constructor( name ) {
    this._name = name
  }

  name() {
    return this._name
  }

  async check() {
    const loaded = await this.loadConfig()

    if ( !loaded ) {
      logger.error( 'No config file found' )
      process.exit( 0 )
    }
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

  async getConfigFile() {
    const loaded = await this.loadConfig()

    return loaded && loaded.filepath
  }

  async getConfig() {
    const loaded = await this.loadConfig()
    return loaded && loaded.config
  }
}

const instances = {}
function singleton( name ) {
  if ( !name ) {
    return
  }

  if ( !instances[ name ] ) {
    instances[ name ] = new Gatherer( name )
  }

  return instances[ name ]
}

function expose( method ) {
  return function ( name ) {
    const instance = singleton( name )
    return instance && instance[ method ] && instance[ method ]()
  }
}

module.exports = {
  check: expose( 'check' ),
  getConfig: expose( 'getConfig' ),
  getConfigFile: expose( 'getConfigFile' ),
}
