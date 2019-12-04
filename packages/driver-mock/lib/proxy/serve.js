const { logger } = require( '@nut-project/dev-utils' )
const { rule } = require( './rule' )
const AnyProxy = require( 'anyproxy' )
const path = require( 'path' )
const exec = require( 'child_process' ).exec
const { ruleMatchApi } = require( '../mock' )

const DEFAULTS = {
  port: 8001,
  context: path.join( process.cwd(), 'mock' ),

  https: false, // 是否为https
  webInterface: {
    enable: true,
    webPort: 8002,
    wsPort: 8003,
  },
  throttle: null, // 限速， 默认不限速
  forceProxyHttps: false, // 不强制拦截https
  wsIntercept: false, // 不开启websocket代理
  silent: true,
}

function checkCa( config ) {
  if ( config.https === 'https' && !AnyProxy.utils.certMgr.ifRootCAFileExists() ) {
    AnyProxy.utils.certMgr.generateRootCA( ( err, keyPath, crtPath ) => {
      // let users to trust this CA before using proxy
      if ( err ) {
        logger.info( `error when generating rootCA ${ err }` )
      } else {
        const certDir = path.dirname( keyPath )
        logger.info( `The cert is generated at ${ certDir }` )
        const isWin = /^win/.test( process.platform )
        if ( isWin ) {
          exec( 'start .', { cwd: path.dirname( crtPath ) } )
        } else {
          exec( `open -R ${ crtPath }` )
        }
      }
    } )
  }
}
async function serve( driver, { userConfig = {} } ) {
  const config = {}
  Object.assign( config, DEFAULTS, userConfig, {
    rule: rule( driver, { config } )
  } )
  checkCa( config )
  ruleMatchApi.getApiList( driver, { config, cache: false } )

  driver.proxyServer = new AnyProxy.ProxyServer( config )
  driver.proxyServer.on( 'ready', () => {
    driver.callHook( 'afterServe', driver.proxyServer )
    logger.success( `mock-server has been started at: http://localhost:${ config.port }` )
  } )
  driver.proxyServer.on( 'error', e => {
    logger.error( `mock-server has error: "${ JSON.stringify( e ) }"` )
  } )
  driver.proxyServer.start()
}
exports.serve = serve
