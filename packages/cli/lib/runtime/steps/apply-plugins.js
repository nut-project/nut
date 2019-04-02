export default async function applyPlugins( allPlugins, { env, app, api, events, plugins } = {} ) {
  for ( let i = 0, len = allPlugins.length; i < len; i++ ) {
    const plugin = allPlugins[ i ][ 0 ]
    const pluginOptions = allPlugins[ i ][ 1 ] || {}

    if ( !plugin.apply ) {
      return
    }

    const stubAPI = {
      ...api,
      expose( prop, value ) {
        plugins[ plugin.localName ] = plugins[ plugin.localName ] || {}
        plugins[ plugin.localName ][ prop ] = value
      },
    }

    const stubEvents = {
      ...events,
      pluginEmit( name, ...args ) {
        if ( name !== '*' ) {
          name = 'plugin:' + plugin.localName + ':' + name
        }
        return events.emit( name, ...args )
      },
    }

    await plugin.apply( {
      env,
      app,
      api: stubAPI,
      events: stubEvents,
    }, pluginOptions )
  }
}
