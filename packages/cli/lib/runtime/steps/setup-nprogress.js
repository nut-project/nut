import NProgress from 'nprogress'

export default function ( nico ) {
  const PROGRESS_CONTAINER_ID = 'progress-container'

  NProgress.configure( {
    parent: '#' + PROGRESS_CONTAINER_ID
  } )

  nico.beforeEach( () => {
    if ( !getParent() ) {
      return
    }

    NProgress.start()
  } )

  nico.afterEach( () => {
    if ( !getParent() ) {
      return
    }

    NProgress.done()
  } )

  function getParent() {
    return document.getElementById( PROGRESS_CONTAINER_ID )
  }
}
