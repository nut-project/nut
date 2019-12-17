const fs = require( 'fs-extra' )
const { getSceneGroupFile } = require( './shared' )

exports.getSceneGroup = async function () {
  const sceneFile = getSceneGroupFile()
  try {
    await fs.ensureFile( sceneFile )
    const sceneGroupList = await fs.readJson( sceneFile, { throws: false } )
    return {
      retCode: 200,
      retDesc: 'success',
      data: sceneGroupList || []
    }
  } catch ( err ) {
    return {
      error: err
    }
  }
}
