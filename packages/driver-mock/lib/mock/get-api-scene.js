exports.getApiScene = async function ( driver, { requestDetail = {} } = {} ) {
  const requestData = requestDetail.requestData
  const { id } = requestData
  if ( !id ) {
    return {
      error: '额，参数错误～'
    }
  }
  const apiSceneList = await driver.addAsyncSeriesWaterfallHook( 'fetchScenes', id )
  return {
    retCode: 200,
    retDesc: 'success',
    data: apiSceneList || []
  }
}
