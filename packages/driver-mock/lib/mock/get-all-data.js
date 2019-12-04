const fs = require( 'fs-extra' )
const { utils } = require( '@nut-project/dev-utils' )
const { CONF } = require( './config' )

exports.getAllData = async function ( driver, { config = {} } = {} ) {
  const mockList = []
  const files = utils.getAllFiles( config.context )
  for ( const file of files ) {
    if ( file.indexOf( CONF.SCENE_PATH ) < 0 ) {
      const obj = await fs.readJson( file, { throws: false } )
      mockList.push( {
        path: file.substr( ( process.cwd() ).length ),
        data: obj || {}
      } )
    }
  }
  return {
    retCode: 200,
    retDesc: 'success',
    data: mockList
  }
}
