const cac = require( 'cac' )
const { utils } = require( '@nut-project/core' )

class Musubi {
  constructor() {
    this.cli = cac()
    this.drivers = {}
    this.plugins = {}
  }

  // use driver
  // name / version / apply
  async use( driver ) {
    if ( !driver.name || !driver.version || !driver.apply ) {
      return
    }

    // should use the same scope in one driver
    let lastScope

    await driver.apply( {
      register: ( scope, plugin ) => {
        if ( typeof plugin === 'undefined' ) {
          plugin = scope
          scope = ''
        }

        const hasLastScope = typeof lastScope !== 'undefined'

        if ( hasLastScope && ( scope !== lastScope ) ) {
          console.log( `Should register the same scope in driver ${ driver.name }\n` )
          process.exit( 0 )
        }

        if ( !hasLastScope ) {
          lastScope = scope
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

    const pendings = plugins.map( plugin => plugin( this.cli ) )
    await Promise.all( pendings )

    const drivers = this.drivers[ scope ]
    utils.poweredBy( drivers )

    this.cli.help()
    this.cli.parse( argv )
  }
}

module.exports = Musubi
