/* global document */
import quicklink from 'quicklink'
import nutConfig from '@/nut-auto-generated-nut-config'

export default function createNico(
  rootRouter,
  routerFactory,
  prefix = '',
  ctx = {},
  pluginOptions = {}
) {
  const { events, pages, globals, api } = ctx

  let defaultCacheable = ctx.app && ctx.app.router && ctx.app.router.defaultCacheable

  // cacheable by default unless user specified `cacheable: false`
  if ( typeof defaultCacheable !== 'boolean' ) {
    defaultCacheable = true
  }

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
        const publicPath = globals.PUBLIC_PATH || '/'
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
          .filter( key => key.indexOf( 'vendors' ) === 0 )
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
      // build
      walk( routeConfigs, ( routeConfig, parent ) => {
        // TODO: ensure slash
        routeConfig.path = prefix + routeConfig.path
        const current = routerFactory.create( {
          ...routeConfig,

          beforeEnter( e ) {
            const { params, query, from, to } = e
            if ( process.env.NODE_ENV === 'development' ) {
              console.log(
                '\n%cMatch%c' + routeConfig.page + '%c\n',
                'background-color: #0089ff;color: #fff;padding: 2px 6px;',
                'background-color: #3c3e6f;color: #fff;padding: 2px 6px;',
                ''
              )
            }

            // re-fetch
            this.resolvePage = routeConfig.component()

            this.resolvePage
              .then( page => {
                let options = {}
                if ( routeConfig.provider === 'plugin' ) {
                  options = pluginOptions[ routeConfig.plugin ] || {}
                }

                let cacheable = api.page( routeConfig.page ).get( 'cacheable' )

                if ( typeof cacheable !== 'boolean' ) {
                  cacheable = defaultCacheable
                }

                if (
                  // cacheable by default unless your declare cacheable: false
                  ( cacheable !== false ) &&
                  this.page
                ) {
                  return this.page
                }

                if ( this.page && this.page.destroy ) {
                  this.page.destroy()
                }

                const pageContext = Object.assign( {}, ctx, {
                  route: {
                    params,
                    query: Object.assign( {}, query ),
                    from,
                    to,
                  }
                } )

                // $$nut may return promise
                return page.default.$$nut( pageContext, options )
              } )
              .then( page => {
                page.attributes = page.attributes || {}
                page.page = ctx.pages.find( page => page.page === this.options.page )
                this.page = page
              } )
              .then( () => {
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
                  if ( process.env.NODE_ENV === 'development' ) {
                    console.log(
                      '\n%cRouterGuard%cbeforeEnter passed%c\n',
                      'background-color: #0089ff;color: #fff;padding: 2px 6px;',
                      'background-color: #3c3e6f;color: #fff;padding: 2px 6px;',
                      ''
                    )
                  }

                  // remove all un-related css
                  const compose = routeConfig.compose || {}
                  const head = document.head

                  if ( compose.id ) {
                    const linkTags = head.getElementsByTagName( 'link' )
                    ;[].forEach.call( linkTags, function ( tag ) {
                      if ( tag.dataset.appid && tag.dataset.appid !== compose.id ) {
                        tag.parentNode.removeChild( tag )
                      }
                    } )
                  }

                  if ( compose.publicPath ) {
                    let baseTag = head.getElementsByTagName( 'base' )[ 0 ]

                    if ( baseTag && baseTag.hasAttribute( 'href' ) ) {
                      baseTag.href = compose.publicPath
                    } else {
                      baseTag = document.createElement( 'base' )
                      baseTag.href = compose.publicPath
                      head.appendChild( baseTag )
                    }
                  }

                  return
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

                    if ( process.env.NODE_ENV === 'development' ) {
                      console.log(
                        '\n%cRouterGuard%cbeforeEnter passed%c\n',
                        'background-color: #0089ff;color: #fff;padding: 2px 6px;',
                        'background-color: #3c3e6f;color: #fff;padding: 2px 6px;',
                        ''
                      )
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
              if ( process.env.NODE_ENV === 'development' ) {
                console.log(
                  '\n%cRouterGuard%cbeforeLeave passed%c\n',
                  'background-color: #0089ff;color: #fff;padding: 2px 6px;',
                  'background-color: #3c3e6f;color: #fff;padding: 2px 6px;',
                  ''
                )
              }
              return
            }

            function next( v ) {
              if ( v === false ) {
                e.next( false )
                return
              }

              nextCount--

              if ( nextCount === 0 ) {
                e.next()

                if ( process.env.NODE_ENV === 'development' ) {
                  console.log(
                    '\n%cRouterGuard%cbeforeLeave passed%c\n',
                    'background-color: #0089ff;color: #fff;padding: 2px 6px;',
                    'background-color: #3c3e6f;color: #fff;padding: 2px 6px;',
                    ''
                  )
                }
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

          update( ...args ) {
            if ( routeConfig.update ) {
              routeConfig.update()
            }

            const page = this.page

            if ( page && typeof page.update === 'function' ) {
              page.update( ...args )
            }
          },

          async enter( { from, to, params, query } = {} ) {
            ctx.api.router.current = this

            const page = this.page

            if ( page ) {
              const DEFAULT_LAYOUT = nutConfig.layout || 'default'

              let oldLayout = DEFAULT_LAYOUT
              let newLayout = DEFAULT_LAYOUT

              if ( from && from.options && from.options.page ) {
                oldLayout = api.page( from.options.page ).get( 'layout' ) || DEFAULT_LAYOUT
              }

              if ( to && to.options && to.options.page ) {
                newLayout = api.page( to.options.page ).get( 'layout' ) || DEFAULT_LAYOUT
              }

              const layouts = {
                from: api.layout.getLayoutByName( oldLayout ),
                to: api.layout.getLayoutByName( newLayout )
              }

              const layout = layouts.to

              if ( oldLayout !== newLayout ) {
                api.layout.unmount( oldLayout )
              }

              if ( ( oldLayout === newLayout ) && from && ctx.api.layout.current ) {
                // no need to inject again
              } else {
                await events.emit( 'layout:before-mount', layout )
                markActive( ctx.api.sidebar.get(), this.name )
                api.layout.mount( newLayout, { ctx } )
                await events.emit( 'layout:after-mount', layout )
              }

              await updateLayoutState( { layout, router: this } )

              // TODO: pass params to page
              await events.emit( 'page:before-mount', page )
              api.layout.mountPage( page )
              await events.emit( 'page:after-mount', page )
            }

            if ( routeConfig.enter ) {
              routeConfig.enter.call( this )
            }

            if ( page && typeof page.enter === 'function' ) {
              page.enter( { from, to, params, query } )
            }

            // use quicklink
            quicklinkSiblingPages( routeConfig )
          },

          leave( ...args ) {
            const page = this.page

            api.layout.unmountPage( page )

            if ( routeConfig.leave ) {
              routeConfig.leave.call( this )
            }

            if ( page && typeof page.leave === 'function' ) {
              page.leave( ...args )
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
    let oldLayoutName = ( nutConfig && nutConfig.layout ) || 'default'
    module.hot.accept( '@/nut-auto-generated-nut-config', () => {
      const currentPage = api.layout.currentPage
      const newLayoutName = ( nutConfig && nutConfig.layout ) || 'default'

      if ( !currentPage || !currentPage.page ) {
        oldLayoutName = newLayoutName
        return
      }

      const pageLayoutName = api.page( currentPage.page.page ).get( 'layout' )

      // layout changed and current page does not use custom layout
      if (
        ( newLayoutName !== oldLayoutName ) &&
        !pageLayoutName
      ) {
        switchLayout( ctx, newLayoutName )

        updateLayoutState( {
          layout: api.layout.getLayoutByName( newLayoutName ),
          router: ctx.api.router.current,
        } )
      } else {
        updateLayoutState( {
          layout: api.layout.getLayoutByName( pageLayoutName ),
          router: ctx.api.router.current,
        } )
      }

      oldLayoutName = newLayoutName
    } )
  }

  async function switchLayout( ctx, name ) {
    const { api } = ctx
    const page = api.layout.currentPage
    api.layout.unmountPage( page )

    const current = api.layout.current
    if ( current ) {
      api.layout.unmount( current.name )
    }

    const newLayout = api.layout.getLayoutByName( name )

    api.layout.mount( newLayout.name, { ctx } )

    await updateLayoutState( {
      layout: newLayout,
      router: ctx.api.router.current,
    } )

    api.layout.mountPage( page )
  }

  function markActive( sidebar = [], activeRouterName = '' ) {
    // for pages
    pages.forEach( page => {
      if ( page.name === activeRouterName ) {
        page.active = true
      } else {
        page.active = false
      }
    } )

    // for sidebar
    let activePage

    walkChildren( sidebar, null, ( child, index, parent ) => {
      child.parent = parent

      if ( child.page && ( child.page.name === activeRouterName ) ) {
        activePage = child
        child.active = true
      } else {
        child.active = false
      }
    } )

    if ( activePage ) {
      let parent = activePage.parent
      while ( parent ) {
        parent.active = true
        parent = parent.parent
      }
    }
  }

  function walkChildren( children, parent, callback ) {
    if ( !children ) {
      return
    }

    if ( Array.isArray( children ) ) {
      children.forEach( ( v, i ) => {
        callback( v, i, parent )

        if ( Array.isArray( v.children ) ) {
          walkChildren( v.children, v, callback )
        }
      } )
    }
  }

  async function updateLayoutState( { layout, router } ) {
    await events.emit( 'layout:before-update', { layout, router } )

    ctx.app = nutConfig

    if ( ctx.app.sidebar ) {
      ctx.api.sidebar.configure( ctx.app.sidebar )
    }

    markActive( ctx.api.sidebar.get(), router && router.name )

    if ( layout.update ) {
      layout.update( { ctx } )
    }

    await events.emit( 'layout:after-update', { layout, router } )
  }

  return nico
}

function walk( routes = [], fn, parent ) {
  routes.forEach( route => {
    const children = route.children || []
    walk( children, fn, fn( route, parent ) )
  } )
}
