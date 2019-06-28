export default function normalizeRoute( str ) {
  str = str.replace( /^\/+/, '/' )
  str = str.replace( /\/+$/, '' )

  if ( str.charAt( 0 ) !== '/' ) {
    return '/' + str
  }

  return str
}
