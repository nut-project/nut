let accessors = {}

export default function ( page ) {
  if ( accessors[ page ] ) {
    return accessors[ page ]
  }

  accessors[ page ] = {
    page,
    attributes: {},
    get( k ) {
      return this.attributes[ k ]
    },
    set( k, v ) {
      this.attributes[ k ] = v
    }
  }

  return accessors[ page ]
}
