const { getApiFile } = require( './shared' )
const fs = require( 'fs-extra' )

// 获取所有用户设置的API列表数据
exports.getApi = async function ( driver, { cache = true } ) {
  const apiFile = getApiFile()
  let apiList = []
  try {
    if ( cache ) {
      await fs.ensureFile( apiFile )
      apiList = await fs.readJson( apiFile, { throws: false } )
      return {
        retCode: 200,
        retDesc: 'success',
        data: apiList || []
      }
    }
  } catch ( err ) {
    return {
      error: err
    }
  }
  return {
    retCode: 200,
    retDesc: 'success',
    data: apiList || []
  }
}
