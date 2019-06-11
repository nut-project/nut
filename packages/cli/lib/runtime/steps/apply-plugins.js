export default async function applyPlugins( allPlugins = [], allPluginOptions = {}, { env, app, api, events, plugins } = {} ) {
  for ( let i = 0, len = allPlugins.length; i < len; i++ ) {
    const plugin = allPlugins[ i ]
    const pluginOptions = allPluginOptions[ plugin.localName ] || {}

    if ( !plugin.apply ) {
      return
    }

    const stubAPI = {
      ...api,
      expose( prop, value ) {
        plugins[ plugin.localName ] = plugins[ plugin.localName ] || {}
        plugins[ plugin.localName ][ prop ] = value
      },
      router: {
        ...api.router,
        format( route ) {
          if ( typeof route === 'string' ) {
            console.warn( '[router.format] cannot format string as route in plugin' )
            return
          }

          route.page = route.page + '@' + plugin.localName

          return api.router.format( route )
        }
      }
    }

    const stubEvents = {
      ...events,
      on( name, handler, once ) {
        handler.__from = 'plugin'
        handler.__plugin = plugin.localName
        events.on.call( this, name, handler, once )
        return this
      },
      once( name, handler ) {
        this.on( name, handler, true )
        return this
      },
      pluginEmit( name, ...args ) {
        if ( name !== '*' ) {
          name = 'plugin:' + plugin.localName + ':' + name
        }
        return events.emit.call( this, name, ...args )
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
