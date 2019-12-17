const path = require( 'path' )
const fs = require( 'fs-extra' )

exports.updateData = function ( driver, { config = {}, requestDetail = {} } ) {
  const requestData = requestDetail.requestData
  const { api, data, scene } = requestData
  if ( !api || !data || !scene ) {
    return {
      error: '额，参数错误～'
    }
  }
  try {
    const filePath = path.join( config.context, `${ api }/data${ scene ? '-' + scene : '' }.json` )
    fs.ensureFile( filePath )

    fs.outputFile( filePath, JSON.stringify( data, null, 4 ) )
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
