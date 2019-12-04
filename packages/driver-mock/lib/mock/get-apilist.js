const { getApiListFile } = require( './shared' )
const fs = require( 'fs-extra' )

exports.getApiList = async function ( driver, { config = {}, cache = true } ) {
  const apiFile = getApiListFile()
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
    apiList = await driver.addAsyncSeriesWaterfallHook( 'fetchSchemas', config )
    if ( apiList ) {
      const apiListStr = JSON.stringify( apiList || [], null, 4 )
      fs.outputFile( apiFile, apiListStr )
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
