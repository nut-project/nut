const fs = require( 'fs-extra' )
const { getSwitchFile } = require( './shared' )

exports.saveSwitch = function ( driver, { requestDetail = {} } ) {
  const switchFile = getSwitchFile()
  const requestData = requestDetail.requestData
  const { switchObj } = requestData
  if ( !switchObj ) {
    return {
      error: '额，参数错误～'
    }
  }
  try {
    fs.ensureFile( switchFile )

    fs.outputFile( switchFile, JSON.stringify( switchObj, null, 4 ) )
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
