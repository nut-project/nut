export default {
  _exposed: {},

  expose( scope, name, value ) {
    const exposed = this._exposed || {}

    exposed[ scope ] = exposed[ scope ] || {}
    exposed[ scope ][ name ] = value

    this._exposed = exposed
  },

  use( scope, name, ...args ) {
    if ( !this._exposed || !this._exposed[ scope ] ) {
      return
    }

    const exposed = this._exposed[ scope ]
    const method = exposed[ name ]

    if ( !method ) {
      return
    }

    if ( typeof method === 'function' ) {
      return method( ...args )
    }

    return method
  },
}
