export default async function applyPlugins( plugins, { api, events } = {} ) {
  for ( let i = 0, len = plugins.length; i < len; i++ ) {
    const plugin = plugins[ i ]

    if ( !plugin.apply ) {
      return
    }

    const stubAPI = {
      expose( methodName, method ) {
        return api.expose( plugin.name, methodName, method )
      },
      ...api,
    }

    const stubEvents = {
      pluginEmit( name, ...args ) {
        if ( name !== '*' ) {
          name = 'plugin:' + plugin.name + ':' + name
        }
        return events.emit( name, ...args )
      },
      ...events,
    }

    plugin.apply( stubAPI, events )
  }
}
