const { openBrowser } = require( '@nut-project/dev-utils' )
const chalk = require( 'chalk' )
const address = require( 'address' )
const boxen = require( 'boxen' )

class ServerInfoPlugin {
  apply( ctx ) {
    const { hook } = ctx.use( 'webpack' )

    let host, port
    hook( 'dangerously_serverOptions', ( serverOptions = {} ) => {
      host = serverOptions.host
      port = serverOptions.port
    } )

    hook( 'stdin', key => {
      const ENTER = '\r'

      if ( key === ENTER ) {
        if ( host && port ) {
          openBrowser( `http://${ host }:${ port }` )
        }
      }
    } )

    hook( 'dangerously_serverOptions', ( serverOptions = {} ) => {
      const { host, port } = serverOptions
      hook( 'afterServe', async () => {
        console.log()
        console.log(
          boxen(
            `Your application will run at${ getTips( { host, port } ) }`,
            {
              padding: 1,
              borderColor: 'gray'
            }
          )
        )

        console.log()
        console.log( chalk.gray( 'Press "Enter" to open in browser' ) )
        console.log()
      } )
    } )
  }
}

module.exports = ServerInfoPlugin

function getTips( { host, port } ) {
  const url = 'http://' + host + ':' + port
  const lanIP = address.ip()
  const lanUrl = lanIP ? `http://${ lanIP }:${ port }` : ''

  const localTips = `\n\nLocal:     ${ chalk.cyan( url ) }`
  const lanTips = lanUrl ? `\n\nNetwork:   ${ chalk.cyan( lanUrl ) }` : ''

  if ( host === '0.0.0.0' ) {
    return localTips + lanTips
  }

  return localTips
}
