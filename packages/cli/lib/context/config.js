const path = require( 'path' )
const fse = require( 'fs-extra' )

module.exports = async function ( config, { env = 'dev' } = {} ) {
  const cwd = process.cwd()

  const file = 'config/config.' + env + '.js'

  const exists = await fse.pathExists( path.join( cwd, 'src/' + file ) )

  if ( !exists ) {
    return
  }

  return `@/${ file }`
}
