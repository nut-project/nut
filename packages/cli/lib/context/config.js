const path = require( 'path' )
const fse = require( 'fs-extra' )

module.exports = async function ( config, { env = 'dev' } = {} ) {
  const cwd = process.cwd()

  const defaultFile = `config/config.default.js`
  const file = `config/config.${ env }.js`

  const defaultExists = await fse.pathExists( path.join( cwd, `src/${ defaultFile }` ) )
  const exists = await fse.pathExists( path.join( cwd, `src/${ file }` ) )

  if ( !exists && !defaultExists ) {
    return
  }

  return {
    imports: [
      defaultExists ? `import config_default from '@/${ defaultFile }';` : ``,
      exists ? `import config from '@/${ file }';` : ``,
    ].filter( Boolean ),
    code: `
      ${ defaultExists ? `` : `const config_default = {}` }
      ${ exists ? `` : `const config = {}` }
      const config_final = Object.assign( {}, config_default, config )
    `,
    key: `config`,
    variable: `config_final`,
  }
}
