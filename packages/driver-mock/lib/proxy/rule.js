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
  const { requestOptions = {} } = requestDetail
  const { referer = '' } = requestOptions.headers || {}
  const res = await ruleMatchApi.getSceneGroup( driver, { config, requestDetail } )
  if ( res && res.data ) { // 匹配场景组的API
    const list = res.data || []
    const matchedAPI = []
    list.map( listItem => {
      const { scenes = [], activeScene, url: router } = listItem
      if ( !referer || ( new RegExp( router ) ).test( referer ) ) {
        if ( activeScene ) {
          const matchedScene = scenes.find( item => item.name === activeScene )
          if ( matchedScene ) {
            matchedScene.group.find( ( { api, id, scene } ) => {
              if ( url === api ) {
                matchedAPI.push( {
                  id,
                  api,
                  scene
                } )
              }
              return url === api
            } )
          }
        }
      }
      return listItem
    } )
    if ( !matchedAPI.length ) { // 匹配默认场景
      const _res = await ruleMatchApi.getApi( driver, { config, requestDetail } )
      const apiList = ( _res && _res.data ) || []
      const matched = apiList.find( item => item.api === url )
      if ( matched ) {
        matchedAPI.push( {
          id: matched.id,
          api: matched.api,
          scene: matched.activeScene
        } )
      }
    }
    requestDetail.requestData.scene = matchedAPI.length ? matchedAPI[ 0 ].scene : ''
    requestDetail.requestOptions.headers[ 'x-driver-mock-scene' ] = requestDetail.requestData.scene
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
      if ( url === '' || url === '/' || url.indexOf( '/?url=' ) === 0 ) {
        const htmlStr = await fs.readFile( path.join( __dirname, '../../client/src/index.html' ), 'utf8' )
        return {
          response: handleReponese( htmlStr, 'text/html; charset=utf-8' )
        }
      // dist资源
      } else if ( url.indexOf( '/mockServer/dist/' ) > -1 || url.indexOf( '.main.js' ) > -1 ) {
        const filePath = path.join( __dirname, '../../client', url.substr( 12 ) )

        const str = await fs.readFile( filePath, 'utf8' )
        const TYPES_OBJ = {
          '.css': 'text/css',
          '.svg': 'text/xml',
          '.js': 'application/javascript; charset=utf-8',
          '.woff': 'application/font-woff'
        }
        const ContentType = TYPES_OBJ[ Object.keys( TYPES_OBJ ).find( key => url.includes( key ) ) || '.js' ]
        return {
          response: handleReponese( str, ContentType )
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
        return handleError( ( res && res.error ) || `【${ url }】 Oops, there has an error ~` )
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
      handleError( error )
    },

    onConnectError( requestDetail, error ) {
      logger.error( `mock-server has connect error: ${ error }` )
    }
  }
}
