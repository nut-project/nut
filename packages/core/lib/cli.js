const cac = require( 'cac' )
const memoize = require( 'fast-memoize' )
const importFresh = require( 'import-fresh' )
const { config, utils, logger } = require( '@nut-project/dev-utils' )

class CLI {
  constructor() {
    this._loader = config( this.constructor.name() )
    this._cli = cac()
    this._deferreds = {}
    this._command = {
      name: '',
      options: {}
    }

    const commands = this.commands() || []

    commands.forEach( ( { command = '', description = '' } ) => {
      this._deferreds[ command ] = createDeferred()

      this._cli
        .command( command, description )
        .allowUnknownOptions()
        .action( options => {
          this._command.name = command
          this._command.options = options
          this._deferreds[ command ].resolve( options )
        } )
    } )

    this._cli.on( 'command:*', () => {
      logger.error(
        `Invalid command: ${ this._cli.args.join( ' ' ) }`
      )
    } )
  }

  async getUserConfig() {
    const config = await this.getConfig()
    return config.config || {}
  }

  async getUserPlugins() {
    const config = await this.getConfig()
    return config.plugins || {}
  }

  // contains config and plugin
  async getConfig() {
    let config = await this._loader.get()

    if ( typeof config === 'function' ) {
      config = config( {
        command: this._command.name || '',
        options: this._command.options || {},
      } )
    }

    return config || {}
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

    function useDriver( driverName ) {
      const driver = drivers.find(
        driver => {
          // lookup constructor inherit chain
          let parent = driver.constructor

          while ( parent ) {
            if (
              typeof parent.name === 'function' &&
              parent.name() === driverName
            ) {
              return true
            }

            parent = Object.getPrototypeOf( parent )
          }

          return false
        }
      )

      return driver.use()
    }

    plugins.forEach( plugin => {
      const resolve = plugin.resolve
      const options = plugin.options || {}

      let Plugin
      try {
        Plugin = importFresh( resolve )
      } catch ( e ) {
        logger.error(
          `Invalid plugin${ plugin.name ? '(' + plugin.name + ')' : '' }: ` + resolve
        )
        console.log( e )
      }

      new Plugin( options ).apply( {
        use: memoize( useDriver ),
      } )
    } )

    const pendings = drivers.map( driver => driver.apply( this ) )

    await Promise.all( pendings )
  }

  action( name, callback ) {
    const deferred = this._deferreds[ name ]

    if ( !deferred ) {
      return
    }

    deferred.promise.then( callback )
  }

  parse( argv ) {
    this._cli.help()
    this._cli.parse( argv )
  }

  // override
  static name() {}
  commands() {}
}

function createDeferred() {
  const deferred = {}

  deferred.promise = new Promise( ( resolve, reject ) => {
    deferred.resolve = resolve
    deferred.reject = reject
  } )

  return deferred
}

module.exports = CLI
