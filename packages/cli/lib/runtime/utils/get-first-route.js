export default function getFirstRoute( config ) {
  let found

  const sidebar = config.sidebar

  sidebar.some( s => {
    const children = s.children

    if ( children[ 0 ] ) {
      found = children[ 0 ]
      return true
    }

    return false
  } )

  if ( !found ) {
    return
  }

  return found.route
}
