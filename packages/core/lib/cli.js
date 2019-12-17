const cac = require( 'cac' )
const memoize = require( 'fast-memoize' )
const importFresh = require( 'import-fresh' )
const { superstruct } = require( 'superstruct' )
const exit = require( 'exit' )
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

    if ( !config ) {
      return {}
    }

    if ( typeof config === 'function' ) {
      config = config( {
        command: this._command.name || '',
        options: this._command.options || {},
      } )
    }

    const validators = this._validators

    if ( validators ) {
      const userConfig = config.config || {}

      for ( const key of Object.keys( validators ) ) {
        const [ error ] = validators[ key ].validate( userConfig[ key ] || {} )

        if ( error ) {
          console.log()
          logger.scope( key + ' validation' ).warn( error.message )
          console.log()
          exit( 0 )
        }
      }
    }

    return config || {}
  }

  async getConfigFile() {
    return await this._loader.getFile()
  }

  // only be exposed to driver
  async getDriverConfig( name ) {
    const config = await this.getUserConfig()

    if ( typeof config[ name ] === 'undefined' ) {
      return {}
    }

    return config[ name ]
  }

  watch() {

  }

  async use( { drivers: Drivers = [], plugins = [] } = {} ) {
    // api/hooks is ready after `new Driver`
    const drivers = Drivers.map( Driver => new Driver( { cli: this } ) )

    // schema
    const struct = superstruct()
    this._validators = Drivers
      .map( Driver => {
        if (
          typeof Driver.name !== 'function' ||
          typeof Driver.schema !== 'function'
        ) {
          return false
        }

        return {
          name: Driver.name(),
          schema: Driver.schema( { struct } ) || {},
        }
      } )
      .filter( Boolean )
      // group by name
      .reduce( ( all, schema ) => {
        all[ schema.name ] = struct( schema.schema )
        return all
      }, {} )

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
      const enable = plugin.enable
      const name = plugin.name

      if ( enable === false ) {
        logger.info( `Plugin${ name ? ' "' + name + '"' : '' } is disabled by "enable: false"` )
        return
      }

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
        logger,
        exit,
      } )
    } )

    console.log()

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
