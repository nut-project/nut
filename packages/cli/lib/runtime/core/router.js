import nutConfig from 'nut-auto-generated-nut-config'
import layoutDefault from '../layouts/default'
import layoutSaber from '../layouts/saber'

export default function createNico( rootRouter, router, prefix = '' ) {
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
            const ctor = routeConfig.component
            const self = this

            if ( typeof ctor === 'function' ) {
              let instance = this.$instance

              if ( !( instance instanceof ctor ) ) {
                instance = new ctor()
              }

              this.$ctor = ctor
              this.$instance = instance
            }

            let nextCount = 0

            if ( typeof ctor === 'function' && this.$instance.beforeEnter ) {
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
                    fns.forEach( fn => fn.call( self.$instance ) )
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

            if ( this.$instance && typeof this.$instance.beforeEnter === 'function' ) {
              this.$instance.beforeEnter( evt )
            }
          },

          beforeLeave( e ) {
            const ctor = routeConfig.component

            let nextCount = 0

            if ( this.$instance && this.$instance.beforeLeave ) {
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

            if ( this.$instance && typeof this.$instance.beforeLeave === 'function' ) {
              this.$instance.beforeLeave( evt )
            }
          },

          update() {
            routeConfig.update && routeConfig.update()

            if ( this.$instance && typeof this.$instance.update === 'function' ) {
              this.$instance.update()
            }
          },

          enter( { from, to, params } ) {
            const ctor = routeConfig.component

            if ( ctor ) {
              let instance = this.$instance

              if ( !( instance instanceof ctor ) ) {
                instance = new ctor()
              }

              this.$ctor = ctor
              this.$instance = instance

              const view = findView( this ) || self.mountNode

              const DEFAULT_LAYOUT = nutConfig.layout || 'default'
              const oldLayout = from && from.options && from.layout || DEFAULT_LAYOUT
              const newLayout = to && to.options && to.layout || DEFAULT_LAYOUT

              // layout 缓存
              self.getLayout( newLayout )

              let layout = null

              if ( oldLayout !== newLayout ) {
                // TODO: 这里的查找不严谨
                if ( layoutCaches[ oldLayout ] ) {
                  // 移除老的layout
                  layoutCaches[ oldLayout ].$inject( false )
                }

                // 注入新的layout
                layoutCaches[ newLayout ].$inject( view )

                layout = layoutCaches[ newLayout ]
              } else if ( from ) {
                // TODO: 需保证 parentNode 相同(或者traces一致)
                layout = layoutCaches[ oldLayout ]
              } else {
                self.getLayout( oldLayout )
                layout = layoutCaches[ oldLayout ]
                layout.$inject( view )
              }

              self.vm = instance
              self.layoutName = newLayout
              self.layout = layout
              self.router = this
              self.params = params

              nico.emit( 'layout', {
                layout,
                router: this,
              } )

              layout.$update()

              instance.data.$router = {
                params,
                // ...
              }
              instance.$update()

              // 检查 $$view 下挂载的 layout 是否是和自己匹配的，如果匹配则不用销毁，否则需要先销毁
              if ( layout.$refs.$$view ) {
                instance.$inject( false )
                instance.$inject( layout.$refs.$$view )
              }
            }

            routeConfig.enter && routeConfig.enter.call( this )

            if ( this.$instance && typeof this.$instance.enter === 'function' ) {
              this.$instance.enter()
            }
          },

          leave() {
            if ( this.$instance ) {
              this.$instance.$inject( false )
            }

            routeConfig.leave && routeConfig.leave.call( this )

            if ( this.$instance && typeof this.$instance.leave === 'function' ) {
              this.$instance.leave()
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
      nico.layout.$inject( false )

      const newLayout = nico.getLayout( name )

      // 动态的$refs，先尝试更新
      nico.emit( 'layout', {
        layout: newLayout,
        router: nico.router,
      } )
      newLayout.$update()

      const $view = newLayout.$refs.$$view
      if ( $view && nico.vm ) {
        nico.vm.$inject( false )
        nico.vm.$inject( $view )
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
    view = parent.$instance && parent.$instance.$refs && parent.$instance.$refs.$$view

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
}

function createLayout( name ) {
  const Layout = layouts[ name ] || layouts.default
  return new Layout()
}

function parseLayout( segment ) {
  if ( !segment ) {
    return ''
  }
  return segment.replace( /(^\/+|の.+)/g, '' )
}

function walk( routes = [], fn, parent ) {
  routes.forEach( route => {
    const children = route.children || []
    walk( children, fn, fn( route, parent ) )
  } )
}
