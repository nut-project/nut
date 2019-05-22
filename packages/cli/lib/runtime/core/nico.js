import quicklink from 'quicklink'
import nutConfig from '@/nut-auto-generated-nut-config'

export default function createNico( rootRouter, routerFactory, prefix = '', ctx = {}, pluginOptions = {} ) {
  const { events, pages, app, globals, api } = ctx

  function findPageByRouteConfig( pages, routeConfig ) {
    return pages.find( page => page.name === routeConfig.name )
  }

  function getSiblingPages( sidebar, page ) {
    let found = []

    walkSidebar( sidebar, ( p, parent ) => {
      if ( p.page && ( p.page.page === page ) ) {
        found = parent
      }
    } )

    return found
  }

  const toString = Object.prototype.toString

  function isArray( obj ) {
    return toString.call( obj ) === '[object Array]'
  }

  function ensureArray( value ) {
    if ( !isArray( value ) ) {
      return [ value ]
    }

    return value
  }

  function getAssetUrls( keys ) {
    return keys
      .reduce( ( total, key ) => {
        const chunks = globals.STATS_ASSETS_BY_CHUNKNAME || {}
        const publicPath = globals.PUBLIC_PATH || './'
        let urls = ensureArray( chunks[ key ] || [] )
        urls = urls.map( url => publicPath + url )
        total.push( ...urls )
        return total
      }, [] )
      .filter( excludeSourcemap )
  }

  const quicklinkBlacklist = {}

  function addToQuicklinkBlacklist( key ) {
    quicklinkBlacklist[ key ] = true
  }

  function excludeQuicklinkBlacklist( page ) {
    return !quicklinkBlacklist[ page.name ]
  }

  const sourceMapRegexp = /\.map$/
  function excludeSourcemap( url ) {
    return !sourceMapRegexp.test( url )
  }

  function quicklinkSiblingPages( routeConfig ) {
    setTimeout( function () {
      // blacklist current page itself
      addToQuicklinkBlacklist( routeConfig.name )

      const sidebar = ctx.api.sidebar.get() || []
      let siblings = getSiblingPages( sidebar, routeConfig.page )

      siblings = siblings.filter( excludeQuicklinkBlacklist )

      const chunkUrls = getAssetUrls( siblings.map( s => s.page && s.page.name ).filter( Boolean ) )
      const vendorUrls = getAssetUrls(
        Object.keys( globals.STATS_ASSETS_BY_CHUNKNAME || {} )
          .filter( key => key.indexOf( 'vendors~' ) === 0 )
      )

      quicklink( {
        urls: [
          ...chunkUrls,
          ...vendorUrls
        ],
      } )
    }, 0 )
  }

  function walkSidebar( sidebar = [], callback ) {
    sidebar.forEach( s => {
      if ( typeof s === 'object' && s.children ) {
        walkSidebar( s.children, callback )
      } else {
        callback( s, sidebar )
      }
    } )
  }

  const nico = {
    on( ...args ) {
      return rootRouter.on( ...args )
    },

    emit( ...args ) {
      return rootRouter.emit( ...args )
    },

    find( ...args ) {
      return rootRouter.find( ...args )
    },

    beforeEach( hook ) {
      return rootRouter.beforeEach( hook )
    },

    afterEach( hook ) {
      return rootRouter.afterEach( hook )
    },

    empty() {
      rootRouter.children.forEach( child => child.delete() )
    },

    define( routeConfigs, root = rootRouter ) {
      const self = this

      // build
      walk( routeConfigs, ( routeConfig, parent ) => {
        // TODO: ensure slash
        routeConfig.path = prefix + routeConfig.path
        const current = routerFactory.create( {
          ...routeConfig,

          beforeEnter( e ) {
            if ( process.env.NODE_ENV === 'development' ) {
              console.log(
                '\n%cMatch%c' + routeConfig.filepath + '%c\n',
                'background-color: #0089ff;color: #fff;padding: 2px 6px;',
                'background-color: #3c3e6f;color: #fff;padding: 2px 6px;',
                ''
              )
            }

            if ( !this.resolvePage ) {
              this.resolvePage = routeConfig.component()
            }

            this.resolvePage
              .then( page => {
                let options = {}
                if ( routeConfig.provider === 'plugin' ) {
                  options = pluginOptions[ routeConfig.plugin ] || {}
                }

                // TODO: where to put attributes.cacheable
                const { attributes = {} } = findPageByRouteConfig( pages, routeConfig ) || {}

                if (
                  // cache by default unless your declare cacheable: false
                  ( attributes.cacheable !== false ) &&
                  this.page
                ) {
                  return this.page
                }

                if ( this.page && this.page.destroy ) {
                  this.page.destroy()
                }

                // $$nut may return promise
                return page.default.$$nut( ctx, options )
              } )
              .then( page => {
                this.page = page
              } )
              .then( () => {
                const self = this
                const page = this.page

                let nextCount = 0

                if ( page.beforeEnter ) {
                  nextCount++
                }

                if ( routeConfig.beforeEnter ) {
                  nextCount++
                }

                if ( nextCount === 0 ) {
                  e.next()
                }

                const fns = []

                function next( v ) {
                  if ( v === false ) {
                    e.next( false )
                    return
                  }

                  if ( typeof v === 'function' ) {
                    fns.push( v )
                  }

                  nextCount--

                  if ( nextCount === 0 ) {
                    if ( fns.length > 0 ) {
                      e.next( function () {
                        fns.forEach( fn => fn() )
                      } )
                    } else {
                      e.next()
                    }
                  }
                }

                const evt = Object.assign( {}, e, { next, meta: routeConfig.meta || {} } )

                if ( routeConfig.beforeEnter ) {
                  routeConfig.beforeEnter( evt )
                }

                if ( page && typeof page.beforeEnter === 'function' ) {
                  page.beforeEnter( evt )
                }
              } )
          },

          beforeLeave( e ) {
            const page = this.page

            let nextCount = 0

            if ( page && page.beforeLeave ) {
              nextCount++
            }

            if ( routeConfig.beforeLeave ) {
              nextCount++
            }

            if ( nextCount === 0 ) {
              e.next()
            }

            function next( v ) {
              if ( v === false ) {
                e.next( false )
                return
              }

              nextCount--

              if ( nextCount === 0 ) {
                e.next()
              }
            }

            const evt = Object.assign( {}, e, { next, meta: routeConfig.meta || {} } )

            if ( routeConfig.beforeLeave ) {
              routeConfig.beforeLeave( evt )
            }

            if ( page && page.beforeLeave === 'function' ) {
              page.beforeLeave( evt )
            }
          },

          update() {
            routeConfig.update && routeConfig.update()

            const page = this.page

            if ( page && typeof page.update === 'function' ) {
              page.update()
            }
          },

          async enter( { from, to, params } ) {
            const page = this.page

            if ( page ) {
              const DEFAULT_LAYOUT = nutConfig.layout || 'default'
              const oldLayout = from && from.options && from.options.layout || DEFAULT_LAYOUT
              const newLayout = to && to.options && to.options.layout || DEFAULT_LAYOUT

              const layouts = {
                from: api.layout.getLayoutByName( oldLayout ),
                to: api.layout.getLayoutByName( newLayout )
              }

              let layout = layouts.to

              if ( oldLayout !== newLayout ) {
                api.layout.unmount( oldLayout )
              }

              if ( ( oldLayout === newLayout ) && from ) {
                // donot have to inject again
              } else {
                await events.emit( 'layout:before-mount', layout )
                markActive( ctx.api.sidebar.get(), this.name )
                api.layout.mount( newLayout, { ctx } )
                await events.emit( 'layout:after-mount', layout )
              }

              await refreshLayout( { layout, router: this } )

              // TODO: pass params to page
              await events.emit( 'page:before-mount', page )
              api.layout.mountPage( page )
              await events.emit( 'page:after-mount', page )
            }

            routeConfig.enter && routeConfig.enter.call( this )

            if ( page && typeof page.enter === 'function' ) {
              page.enter()
            }

            ctx.api.router.current = this

            // use quicklink
            quicklinkSiblingPages( routeConfig )
          },

          leave() {
            const page = this.page

            api.layout.unmountPage( page )

            routeConfig.leave && routeConfig.leave.call( this )

            if ( page && typeof page.leave === 'function' ) {
              page.leave()
            }
          }
        } )

        parent = parent || root
        parent.append( current )

        const page = findPageByRouteConfig( pages, routeConfig )

        if ( page ) {
          page.router = current
        }

        return current
      } )

      rootRouter.prepare()
    },

    start( mountNode ) {
      if ( mountNode ) {
        if ( typeof mountNode === 'string' ) {
          this.mountNode = document.querySelector( mountNode )
        } else {
          this.mountNode = mountNode
        }

        api.layout.root = this.mountNode

        rootRouter.start()
      } else {
        rootRouter.recursive( ins => {
          ins.activate()
        } )
      }
    },

    stop() {
      rootRouter.recursive( ins => {
        if ( ins !== rootRouter ) {
          ins.delete()
        }
      } )
    },
  }

  if ( module.hot ) {
    module.hot.accept( '@/nut-auto-generated-nut-config', () => {
      const newLayout = nutConfig && nutConfig.layout || 'default'
      if ( nico.layoutName !== newLayout ) {
        switchLayout( ctx, nico, nutConfig && nutConfig.layout || 'default' )
      }
    } )
  }

  async function switchLayout( ctx, nico, name ) {
    const { api } = ctx
    const page = api.layout.currentPage
    api.layout.unmountPage( page )

    const current = api.layout.current
    if ( current ) {
      api.layout.unmount( current.name )
    }

    const newLayout = api.layout.getLayoutByName( name )

    api.layout.mount( newLayout.name, { ctx } )

    await refreshLayout( {
      layout: newLayout,
      router: ctx.api.router.current,
    } )

    api.layout.mountPage( page )
  }

  function markActive( sidebar = [], activeRouterName = '' ) {
    sidebar.forEach( s => {
      let isAnyPageActive = false
      let route = {
        found: false,
        value: ''
      }

      if ( !s.children ) {
        return
      }

      // TODO: walk
      s.children.forEach( child => {
        if ( !route.found ) {
          route.value = child.page.route
          route.found = true
        }

        if ( child.page.name === activeRouterName ) {
          isAnyPageActive = true
          child.active = true
        } else {
          child.active = false
        }
      } )

      if ( isAnyPageActive ) {
        s.active = true
      } else {
        s.active = false
      }

      s.route = route.value
    } )
  }

  async function refreshLayout( { layout, router } ) {
    await events.emit( 'layout:before-update', { layout, router: this } )

    ctx.app = nutConfig

    if ( ctx.app.sidebar ) {
      ctx.api.sidebar.configure( ctx.app.sidebar )
    }

    markActive( ctx.api.sidebar.get(), router.name )

    layout.update && layout.update( { ctx } )

    await events.emit( 'layout:after-update', { layout, router: this } )
  }

  return nico
}

function walk( routes = [], fn, parent ) {
  routes.forEach( route => {
    const children = route.children || []
    walk( children, fn, fn( route, parent ) )
  } )
}
