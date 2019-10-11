export default async function applyModules( modules = [], ctx = {} ) {
  const { env, app, config, pages, events } = ctx

  for ( let i = 0, len = modules.length; i < len; i++ ) {
    const [ pluginName, mod, moduleOptions ] = modules[ i ]

    const stubRouter = {
      ...ctx.api.router,
      format( route, options ) {
        options = options || {}

        if ( typeof route === 'string' ) {
          route = ctx.api.router.getSegment( route )
        }

        if ( options.scoped === true ) {
          // localName is unknown in plugin, so string is meaningless
          if ( typeof route === 'string' ) {
            console.warn( '[router.format] format string is not allowed in plugin' )
            return
          }

          route.page = route.page + '@' + pluginName

          return ctx.api.router.format( route )
        }

        return ctx.api.router.format( route )
      }
    }

    Object.defineProperty( stubRouter, 'current', {
      get() {
        return ctx.api.router.current
      },
      set( value ) {
        ctx.api.router.current = value
      }
    } )

    const stubAPI = {
      ...ctx.api,
      expose( name, value ) {
        ctx.expose( pluginName, name, value )
      },
      router: stubRouter
    }

    const stubEvents = {
      ...events,
      on( name, handler, once ) {
        handler.__from = 'plugin'
        handler.__plugin = pluginName
        events.on.call( this, name, handler, once )
        return this
      },
      once( name, handler ) {
        this.on( name, handler, true )
        return this
      },
      emit( name, ...args ) {
        if ( name !== '*' ) {
          name = 'plugin:' + pluginName + ':' + name
        }
        return events.emit.call( this, name, ...args )
      },
      emitGlobal( name, ...args ) {
        return events.emit.call( this, name, ...args )
      }
    }

    if ( typeof mod !== 'function' ) {
      return
    }

    await mod( {
      env,
      config,
      app,
      pages,
      api: stubAPI,
      events: stubEvents,
    }, moduleOptions )
  }
}
