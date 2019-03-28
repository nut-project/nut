import defaultLayout from '../layouts/default'
import saberLayout from '../layouts/saber'

export default function createNico( rootRouter, router, prefix = '' ) {
  return {
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

      const layoutCaches = {}

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

              // 尝试复用旧路由的layout，同时做一层历史layout的缓存
              const oldSegment = from && from.segment
              const newSegment = to && to.segment

              const oldLayout = parseLayout( oldSegment ) || 'default'
              const newLayout = parseLayout( newSegment ) || 'default'

              if ( !layoutCaches[ newLayout ] ) {
                const Layout = findLayout( newLayout )
                // layout缓存
                layoutCaches[ newLayout ] = new Layout()
              }

              let layout = null

              if ( oldLayout !== newLayout ) {
                // 移除老的layout
                if ( layoutCaches[ oldLayout ] ) {
                  // TODO: 这里的查找不严谨
                  layoutCaches[ oldLayout ].$inject( false )
                }

                // 注入新的layout
                layoutCaches[ newLayout ].$inject( view )

                layout = layoutCaches[ newLayout ]
              } else if ( oldSegment ) {
                // TODO: 需保证 parentNode 相同(或者traces一致)
                layout = layoutCaches[ oldLayout ]
              } else {
                layout = layoutCaches[ oldLayout ]
                layout.$inject( view )
              }

              self.layout = layout

              rootRouter.emit( 'layout', {
                layout,
                router: this,
              } )

              layout.$update()

              instance.data.$router = {
                params,
                // ...
              }
              instance.$update()

              // 检查当前是否在视图中
              if (
                instance.group &&
                instance.group.children &&
                instance.group.children.find( n => {
                  if ( typeof n.nodeType !== 'undefined' ) {
                    return !n.parentNode
                  }

                  if ( typeof n.node === 'function' ) {
                    return !n.node().parentNode
                  }

                  return true
                } )
              ) {
                // 检查 $$view 下挂载的 layout 是否是和自己匹配的，如果匹配则不用销毁，否则需要先销毁
                if ( layout.$refs.$$view ) {
                  instance.$inject( layout.$refs.$$view )
                }
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
  default: defaultLayout,
  saber: saberLayout,
}

function findLayout( name ) {
  return layouts[ name ] || layouts.default
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
