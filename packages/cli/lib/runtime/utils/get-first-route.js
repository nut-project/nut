export default function getFirstRoute( config ) {
  let found

  const sidebar = config.sidebar

  sidebar.some( s => {
    const pages = s.pages

    return pages.some( page => {
      if ( !page.hidden ) {
        found = page
        return true
      }

      return false
    } )
  } )

  if ( !found ) {
    return
  }

  return found.route
}
