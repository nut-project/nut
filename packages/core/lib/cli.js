const cac = require( 'cac' )
const { config, utils, logger } = require( '@nut-project/dev-utils' )
// const chokidar = require( 'chokidar' )

class CLI {
  constructor() {
    this._loader = config( this.constructor.name() )
    this._cli = cac()
    this._actions = {}

    const commands = this.commands() || []

    commands.forEach( ( { command = '', description = '' } ) => {
      this._cli
        .command( command, description )
        .allowUnknownOptions()
        .action( options => {
          const actions = this._actions[ command ]

          if ( !actions || actions.length === 0 ) {
            logger.error( `No actions is found for command "${ command }"` )
            return
          }

          series( actions, options )
        } )
    } )
  }

  async getConfig() {
    return await this._loader.get()
  }

  async getConfigFile() {
    return await this._loader.getFile()
  }

  watch() {

  }

  async use( { drivers: Drivers = [], plugins = [] } = {} ) {
    // api/hooks is ready after `new Driver`
    const drivers = Drivers.map( Driver => new Driver() )

    utils.poweredBy( drivers )

    plugins.forEach( plugin => {
      const Plugin = plugin.plugin
      const options = plugin.options || {}
      new Plugin( { drivers } ).apply( options )
    } )

    const pendings = drivers.map( driver => driver.apply( this ) )

    await Promise.all( pendings )
  }

  action( name, callback ) {
    this._actions[ name ] = this._actions[ name ] || []
    this._actions[ name ].push( callback )
  }

  parse( argv ) {
    this._cli.help()
    this._cli.parse( argv )
  }

  // override
  static name() {}
  commands() {}
}

function series( functions, options ) {
  return functions.reduce( async ( total, fn ) => {
    await total
    await fn( options )
  }, Promise.resolve() )
}

module.exports = CLI
