import NProgress from 'nprogress'

export default function ( nico ) {
  const PROGRESS_CONTAINER_ID = 'progress-container'

  NProgress.configure( {
    parent: '#' + PROGRESS_CONTAINER_ID
  } )

  nico.afterEach( () => {
    if ( !getParent() ) {
      return
    }

    NProgress.done( true )
  } )

  function getParent() {
    return document.getElementById( PROGRESS_CONTAINER_ID )
  }
}
