/* global NUT_CLI_DYNAMIC, fetch */
function onHMRStatusTransferTo( condition = () => false, callback = () => {} ) {
  if ( module.hot ) {
    /* eslint-disable */
    function handler( status ) {
      if ( condition( status ) === true ) {
        module.hot.removeStatusHandler( handler )
        callback()
      }
    }
    /* eslint-enable */

    module.hot.addStatusHandler( handler )
  }
}

// trigger dynamic build before route lifecycle enter
async function dynamicBuild( page ) {
  if ( !NUT_CLI_DYNAMIC || ( process.env.NODE_ENV === 'production' ) ) {
    return
  }

  if ( module.hot && page ) {
    const promise = new Promise( resolve => {
      if ( module.hot.status() === 'idle' ) {
        onHMRStatusTransferTo(
          status => status !== 'idle',
          () => {
            onHMRStatusTransferTo(
              status => status === 'idle',
              () => {
                resolve()
              }
            )
          }
        )
      } else {
        onHMRStatusTransferTo(
          status => status === 'idle',
          resolve
        )
      }
    } )

    let json
    try {
      const response = await fetch( `/_nut_dynamic_build_page?page=${
        encodeURIComponent( page )
      }` )
      json = await response.json()
    } catch ( e ) {
      console.log( e )
    }

    if ( json.success && ( json.waitHotApply === true ) ) {
      if ( module.hot.status() === 'idle' ) {
        // force trigger hmr update if still in idle status
        try {
          await module.hot.check( true )
        } catch ( e ) {
          console.log( e )
        }
      }
      await promise
    }
  }
}

export default dynamicBuild
