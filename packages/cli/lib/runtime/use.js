export default function use( pluginName, methodName, ...args ) {
  const plugins = this.plugins || {}
  const exposed = plugins[ pluginName ]

  if ( !exposed ) {
    return
  }

  const method = exposed[ methodName ]

  if ( !method ) {
    return
  }

  if ( typeof method === 'function' ) {
    return method( ...args )
  }

  return method
}
