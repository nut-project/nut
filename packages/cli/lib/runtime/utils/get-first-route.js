export default function getFirstRoute( config ) {
  let found

  const sidebar = config.sidebar

  sidebar.some( s => {
    const pages = s.pages

    if ( pages[ 0 ] ) {
      found = pages[ 0 ]
      return true
    }

    return false
  } )

  if ( !found ) {
    return
  }

  return found.route
}
