import quicklink from 'quicklink'
import nutConfig from 'nut-auto-generated-nut-config'
import layoutDefault from '../layouts/default'
import layoutSaber from '../layouts/saber'
import layoutNone from '../layouts/none'
import layoutNow from '../layouts/now'

export default function createNico( rootRouter, router, prefix = '', ctx = {}, pluginOptions = {} ) {
  const { events, pages, app, globals } = ctx

  function findPageByRouteConfig( pages, routeConfig ) {
    return pages.find( page => page.name === routeConfig.name )
  }

  function getSiblingPages( sidebar, pages, page ) {
    let found = []

    walkSidebar( sidebar, ( p, parent ) => {
      if ( p.page === page ) {
        found = parent
      }
    } )

    return found
  }

  function getAssetUrls( keys ) {
    return keys
      .reduce( ( total, key ) => {
        const chunks = globals.STATS_ASSETS_BY_CHUNKNAME || {}
        let urls = chunks[ key ] || []
        urls = urls.map( url => globals.PUBLIC_PATH + url )
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

      const sidebar = app.sidebar || []
      let siblings = getSiblingPages( sidebar, pages, routeConfig.page )

      siblings = siblings.filter( excludeQuicklinkBlacklist )

      const chunkUrls = getAssetUrls( siblings.map( s => s.name ) )
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

  const layoutCaches = {}
  const nico = {
    getLayout( name ) {
      const cached = layoutCaches[ name ]
      if ( cached ) {
        return cached
      }

      const layout = createLayout( name )
      layoutCaches[ name ] = layout

      return layout
    },

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
        const current = router.create( {
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

          enter( { from, to, params } ) {
            const page = this.page

            if ( page ) {
              const view = findView( this ) || self.mountNode

              const DEFAULT_LAYOUT = nutConfig.layout || 'default'
              const oldLayout = from && from.options && from.options.layout || DEFAULT_LAYOUT
              const newLayout = to && to.options && to.options.layout || DEFAULT_LAYOUT

              const layouts = {
                from: self.getLayout( oldLayout ),
                to: self.getLayout( newLayout )
              }

              if ( oldLayout !== newLayout ) {
                layouts.from.$inject( false )
              }

              if ( ( oldLayout === newLayout ) && from ) {
                // donot have to inject again
              } else {
                events.emit( 'layout:before-mount', layouts.to )
                layouts.to.$inject( view )
                events.emit( 'layout:after-mount', layouts.to )
              }

              let layout = layouts.to

              this.layout = layout

              self.layoutName = newLayout
              self.layout = layout
              self.layouts = layouts
              self.router = this
              self.params = params
              self.page = page

              nico.emit( 'layout', {
                layout,
                router: this,
              } )

              layout.$update()

              // TODO: pass params to instance

              if ( layout.$refs.$$view ) {
                page.mount( layout.$refs.$$view )
              }
            }

            routeConfig.enter && routeConfig.enter.call( this )

            if ( page && typeof page.enter === 'function' ) {
              page.enter()
            }

            // use quicklink
            quicklinkSiblingPages( routeConfig )
          },

          leave() {
            const page = this.page
            const view = this.layout.$refs.$$view

            page.unmount( view )

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
    },

    start( mountNode ) {
      if ( mountNode ) {
        if ( typeof mountNode === 'string' ) {
          this.mountNode = document.querySelector( mountNode )
        } else {
          this.mountNode = mountNode
        }
        rootRouter.start()
      } else { // 如果不是真正的根节点，只需要激活即可
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
    module.hot.accept( 'nut-auto-generated-nut-config', () => {
      const newLayout = nutConfig && nutConfig.layout || 'default'
      if ( nico.layoutName !== newLayout ) {
        switchLayout( nico, nutConfig && nutConfig.layout || 'default' )
      }
    } )
  }

  return nico
}

function switchLayout( nico, name ) {
  if ( nico.layout ) {
    const mountNode = nico.layout.parentNode

    if ( mountNode ) {
      nico.page && nico.page.unmount( nico.layout.$refs.$$view )
      nico.layout.$inject( false )

      const newLayout = nico.getLayout( name )

      // 动态的$refs，先update
      nico.emit( 'layout', {
        layout: newLayout,
        router: nico.router,
      } )
      newLayout.$update()

      const $view = newLayout.$refs.$$view
      if ( $view ) {
        nico.page && nico.page.mount( $view )
      }

      nico.layout = newLayout
      nico.layoutName = name

      nico.router.layout = newLayout

      newLayout.$inject( mountNode )
    }
  }
}

function findView( context ) {
  let parent = context.parent
  let view
  while ( true ) {
    view = parent.layout && parent.layout.$refs && parent.layout.$refs.$$view

    if ( view ) {
      break
    }

    parent = parent.parent

    if ( !parent ) {
      break
    }
  }

  return view
}

const layouts = {
  default: layoutDefault,
  saber: layoutSaber,
  none: layoutNone,
  now: layoutNow,
}

function createLayout( name ) {
  const Layout = layouts[ name ] || layouts.default
  return new Layout()
}

function walk( routes = [], fn, parent ) {
  routes.forEach( route => {
    const children = route.children || []
    walk( children, fn, fn( route, parent ) )
  } )
}
