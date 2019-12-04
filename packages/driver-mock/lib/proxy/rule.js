const path = require( 'path' )
const fs = require( 'fs-extra' )
const { logger } = require( '@nut-project/dev-utils' )
const { ruleMatchApi } = require( '../mock' )

function handleError( error = '' ) {
  const message = 'mock-server 无法代理本地址～'
  logger.error( `mock-server has error: ${ error || message }` )
  const res = { }
  if ( typeof error === 'string' ) {
    res.message = error || message
  } else {
    Object.assign( res, {
      ...error,
      message
    } )
  }
  return {
    response: {
      statusCode: 500,
      header: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'x-driver-mock': '1',
      },
      body: JSON.stringify( res ),
    }
  }
}
function handleReponese( res, contentType ) {
  if ( res ) {
    let body = res
    if ( typeof body === 'object' ) {
      body = JSON.stringify( body )
    }

    const localResponse = {
      statusCode: 200,
      header: {
        'Content-Type': contentType || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'x-driver-mock': '1',
      },
      body,
    }

    return localResponse
  }

  return {}
}
async function addsceneHeader( driver, { url, config, requestDetail } ) {
  if ( config.group ) {
    const res = await ruleMatchApi.getSceneGroup( driver, { config, requestDetail } )
    if ( res && res.data ) {
      const curSceneGroup = ( res.data || [] ).find( ( { group } ) => {
        return group === config.group
      } )
      if ( curSceneGroup ) {
        const curApi = ( curSceneGroup.apiList || [] ).find( ( { api } ) => {
          return url === api
        } )
        if ( curApi && curApi.scene ) {
          requestDetail.requestOptions.headers[ 'x-driver-mock-scene' ] = curApi.scene
        }
      }
    }
  }
}
exports.rule = function ( driver, { config = {} } = {} ) {
  return {
    summary: 'mock-server will return mock data for your project',
    async beforeSendRequest( requestDetail ) {
      const { url } = requestDetail

      // mock-server页面
      if ( url === '/favicon.ico' ) {
        return null
      }
      if ( url === '' || url === '/' ) {
        const htmlStr = await fs.readFile( path.join( __dirname, '../template/index.html' ), 'utf8' )
        return {
          response: handleReponese( htmlStr, 'text/html; charset=utf-8' )
        }
      } else if ( url.indexOf( '/mockServer/' ) > -1 ) {
        let requestData = requestDetail.requestData.toString()
        try {
          requestData = JSON.parse( requestData || '{}' )
        } catch ( e ) {
          logger.error( 'requestData has an error～' )
        }
        requestDetail.requestData = requestData

        const method = url.replace( /(\/mockServer\/|\?.+)/g, '' )
        const res = await ruleMatchApi[ method ]( driver, { config, requestDetail } )
        if ( res && !res.error ) {
          return {
            response: handleReponese( res )
          }
        }
        console.log( url, '===url' )
        return handleError( ( res && res.error ) || 'Oops, there has an error ~' )
      }
      // 增加api的scene
      await addsceneHeader( driver, { url, config, requestDetail } )

      const res = await ruleMatchApi.getData( driver, { config, requestDetail } )
      if ( res && !res.error ) {
        return {
          response: handleReponese( res )
        }
      }
      // 利用钩子函数获取数据
      try {
        const hookRes = await driver.callHook( 'notfound', requestDetail )
        if ( hookRes ) {
          return {
            response: handleReponese( hookRes )
          }
        }
      } catch ( e ) {
        return handleError( e )
      }
    },

    beforeSendResponse() {
    },

    beforeDealHttpsRequest() {
      return true
    },

    onError( requestDetail, error ) {
      console.log( 'BBBBB' )
      handleError( error )
    },

    onConnectError( requestDetail, error ) {
      logger.error( `mock-server has connect error: ${ error }` )
    }
  }
}
