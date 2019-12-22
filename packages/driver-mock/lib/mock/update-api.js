const { getApiFile } = require( './shared' )
const fs = require( 'fs-extra' )

exports.updateApi = function ( driver, { requestDetail = {} } ) {
  const requestData = requestDetail.requestData
  const { apis } = requestData
  const filePath = getApiFile()
  if ( !apis ) {
    return {
      error: '额，参数错误～'
    }
  }
  try {
    fs.ensureFile( filePath )

    fs.outputFile( filePath, JSON.stringify( apis, null, 4 ) )
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
