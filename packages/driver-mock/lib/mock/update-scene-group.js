const { getSceneGroupFile } = require( './shared' )
const fs = require( 'fs-extra' )

exports.updateSceneGroup = function ( driver, { requestDetail = {} } ) {
  const sceneFile = getSceneGroupFile()
  try {
    const requestData = requestDetail.requestData
    const { sceneGroupList } = requestData
    if ( !sceneGroupList ) {
      return {
        error: '额，参数错误～'
      }
    }
    fs.outputFile( sceneFile, JSON.stringify( sceneGroupList, null, 4 ) )
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
