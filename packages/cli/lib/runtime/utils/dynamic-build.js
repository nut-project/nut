/* global NUT_CLI_DYNAMIC, fetch */
function onHMRStatusTransferTo( condition = () => false, callback = () => {} ) {
  if ( module.hot ) {
    /* eslint-disable */
    function handler( status ) {
      if ( ( condition( status ) === true ) && ( handler.disable !== true ) ) {
        callback()

        // let's disable it and remove it later
        handler.disable = true

        // don't remove handler while handlers are executing in loops
        // or some handler won't be executed
        setTimeout( function () {
          module.hot.removeStatusHandler( handler )
        }, 0 )
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
    const deferred = {
      page,
    }
    deferred.promise = new Promise( ( resolve, reject ) => {
      deferred.resolve = resolve
      deferred.reject = reject
    } )

    if ( module.hot.status() === 'idle' ) {
      // console.log( 'idle -> !idle -> idle' )
      onHMRStatusTransferTo(
        status => status !== 'idle',
        function () {
          onHMRStatusTransferTo(
            status => status === 'idle',
            deferred.resolve
          )
        }
      )
    } else {
      // console.log( '!idle -> idle' )
      onHMRStatusTransferTo(
        status => status === 'idle',
        deferred.resolve
      )
    }

    let json
    try {
      const response = await fetch( `/_nut_dynamic_build_page?page=${
        encodeURIComponent( page )
      }` )
      json = await response.json()
    } catch ( e ) {
      console.log( e )
    }

    if ( json && json.success && ( json.waitHotApply === true ) ) {
      if ( module.hot.status() === 'idle' ) {
        // force trigger hmr update if still in idle status
        try {
          await module.hot.check( true )
        } catch ( e ) {
          console.log( e )
        }
      }

      await deferred.promise
    } else {
      deferred.resolve()
    }
  }
}

export default dynamicBuild
