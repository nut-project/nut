const cac = require( 'cac' )

class Musubi {
  constructor() {
    this.cli = cac()
    this.plugins = {}
  }

  use( scope, plugin ) {
    if ( typeof plugin === 'undefined' ) {
      plugin = scope
      scope = ''
    }

    this.plugins[ scope ] = this.plugins[ scope ] || []
    this.plugins[ scope ].push( plugin )
  }

  async apply( { version } = {} ) {
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

    if ( version ) {
      this.cli.version( version )
    }

    this.cli.help()
    this.cli.parse( argv )
  }
}

module.exports = Musubi
