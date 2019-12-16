export default function getFirstRoute( context ) {
  let found

  const sidebar = context.api.sidebar.get()

  walkChildren( sidebar, null, child => {
    if ( child.page && !found ) {
      found = child
    }
  } )

  if ( !found || !found.page ) {
    return
  }

  return found.page.route
}

function walkChildren( children, parent, callback ) {
  if ( !children ) {
    return
  }

  if ( Array.isArray( children ) ) {
    children.forEach( ( v, i ) => {
      callback( v, i, parent )

      if ( Array.isArray( v.children ) ) {
        walkChildren( v.children, v, callback )
      }
    } )
  }
}
