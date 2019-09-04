export default function getFirstRoute( context ) {
  let found

  const sidebar = context.api.sidebar.get()

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

  return found.page.route
}
