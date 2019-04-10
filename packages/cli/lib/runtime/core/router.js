import nutConfig from 'nut-auto-generated-nut-config'
import layoutDefault from '../layouts/default'
import layoutSaber from '../layouts/saber'
import layoutNone from '../layouts/none'

export default function createNico( rootRouter, router, prefix = '', ctx = {} ) {
  const { events } = ctx

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

            if ( !this.page ) {
              this.page = routeConfig.component( ctx )
            }

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

              // 检查 $$view 下挂载的 layout 是否是和自己匹配的，如果匹配则不用销毁，否则需要先销毁
              if ( layout.$refs.$$view ) {
                page.mount( layout.$refs.$$view )
              }
            }

            routeConfig.enter && routeConfig.enter.call( this )

            if ( page && typeof page.enter === 'function' ) {
              page.enter()
            }
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
