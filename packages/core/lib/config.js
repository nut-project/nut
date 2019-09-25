const cosmiconfig = require( 'cosmiconfig' )
const logger = require( './logger' )

class Config {
  constructor( name ) {
    this._name = name
  }

  name() {
    return this._name
  }

  async check() {
    const loaded = await this.load()

    if ( !loaded ) {
      logger.error( 'No config file found' )
      process.exit( 0 )
    }
  }

  load() {
    return this._load()
  }

  loadSync() {
    return this._load( { sync: true } )
  }

  _load( options = {} ) {
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

  async getFile() {
    const loaded = await this.load()

    return loaded && loaded.filepath
  }

  async get() {
    const loaded = await this.load()
    return loaded && loaded.config
  }
}

const instances = {}
function singleton( name ) {
  if ( !name ) {
    return
  }

  if ( !instances[ name ] ) {
    instances[ name ] = new Config( name )
  }

  return instances[ name ]
}

module.exports = name => singleton( name )
