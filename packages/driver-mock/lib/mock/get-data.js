const path = require( 'path' )
const fs = require( 'fs-extra' )

exports.getData = async function ( driver, { config = {}, requestDetail = {} } = {} ) {
  const { api, scene } = ( requestDetail || {} ).requestData || {}
  const url = api || requestDetail.url
  const filePath = path.join( config.context, `${ url }/data${ ( scene && scene !== 'default' ) ? '-' + scene : '' }.json` )
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
    const hookRes = await driver.callHook( 'fetchSceneMockData', requestDetail )
    if ( hookRes && hookRes.data ) {
      return {
        retCode: 200,
        retDesc: 'success',
        data: hookRes && hookRes.data
      }
    }
    if ( api ) {
      return {
        retCode: 200,
        retDesc: 'success',
        data: {}
      }
    }
    return {
      error: 'mock-server 无法代理本地址～'
    }
  } catch ( err ) {
    return {
      error: `mock数据不是合法JSON对象，请确认～`
    }
  }
}
