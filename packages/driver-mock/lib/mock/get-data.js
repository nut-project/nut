const path = require( 'path' )
const fs = require( 'fs-extra' )

exports.getData = async function ( driver, { config = {}, requestDetail = {} } = {} ) {
  const filePath = path.join( config.context, `${ requestDetail.url }.json` )
  try {
    const isExists = await fs.pathExists( filePath )
    if ( isExists ) {
      const mockData = await fs.readJson( filePath )
      return {
        retCode: 200,
        retDesc: 'success',
        data: mockData
      }
    }
  } catch ( err ) {
    return {
      error: `mock数据不是合法JSON对象，请确认～`
    }
  }
}
