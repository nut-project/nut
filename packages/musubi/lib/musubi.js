const cac = require( 'cac' )
const { utils } = require( '@nut-project/core' )

class Musubi {
  constructor() {
    this.cli = cac()
    this.drivers = {}
    this.plugins = {}
  }

  // use driver
  // name / version / scope / apply
  async use( driver ) {
    if ( !driver.name || !driver.version || !driver.scope || !driver.apply ) {
      return
    }

    const scope = driver.scope

    await driver.apply( {
      scope,
      register: plugin => {
        if ( typeof plugin === 'undefined' ) {
          return
        }

        this.plugins[ scope ] = this.plugins[ scope ] || []
        if ( !this.plugins[ scope ].includes( plugin ) ) {
          this.plugins[ scope ].push( plugin )
        }

        this.drivers[ scope ] = this.drivers[ scope ] || []
        if ( !this.drivers[ scope ].includes( driver ) ) {
          this.drivers[ scope ].push( driver )
        }
      }
    } )
  }

  version( version ) {
    if ( version ) {
      this.cli.version( version )
    }
  }

  async apply() {
    const argv = process.argv

    // find matched plugins by scope
    // e.g. rootCommand <scope> subCommand --option
    let scope = argv[ 2 ]
    let plugins = this.plugins[ scope ]

    // remove scope from argv
    if ( plugins ) {
      argv.splice( 2, 1 )
    }

    // use plugins from ''
    if ( !plugins ) {
      scope = ''
      plugins = this.plugins[ '' ] || []
    }

    if ( plugins && plugins.length === 0 ) {
      console.log( '\nCommand not found\n' )
    }

    const drivers = this.drivers[ scope ]
    utils.poweredBy( drivers )

    const pendings = plugins.map( plugin => plugin( this.cli ) )
    await Promise.all( pendings )

    this.cli.help()
    this.cli.parse( argv )
  }
}

module.exports = Musubi
