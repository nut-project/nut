const path = require( 'path' )
const fse = require( 'fs-extra' )

module.exports = async function ( config, { env = 'development' } = {} ) {
  const cwd = process.cwd()

  const map = {
    'development': 'dev',
    'production': 'prod',
  }

  const file = 'config/config.' + map[ env ] + '.js'

  const exists = await fse.pathExists( path.join( cwd, 'src/' + file ) )

  if ( !exists ) {
    return
  }

  return `@/${ file }`
}
