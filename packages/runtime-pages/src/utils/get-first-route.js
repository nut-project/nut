export default function getFirstRoute( context ) {
  let found

  const sidebar = context.api.sidebar.get()

  sidebar.some( s => {
    if ( s.page ) {
      found = s
      return true
    }

    const children = s.children

    // TODO: use walkChildren
    if ( children && children[ 0 ] ) {
      found = children[ 0 ]
      return true
    }

    return false
  } )

  if ( !found ) {
    return
  }

  return found.page.route
}
