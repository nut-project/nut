const path = require( 'path' )
const fs = require( 'fs-extra' )

exports.updateData = function ( driver, { config = {}, requestDetail = {} } ) {
  const requestData = requestDetail.requestData
  const { filePath, data } = requestData
  if ( !filePath || !data ) {
    return {
      error: '额，参数错误～'
    }
  }
  try {
    const file = path.join( config.context, filePath )
    fs.outputFile( file, JSON.stringify( data, null, 4 ) )
    return {
      retCode: 200,
      retDesc: 'success',
      data: null
    }
  } catch ( err ) {
    return {
      error: err
    }
  }
}
