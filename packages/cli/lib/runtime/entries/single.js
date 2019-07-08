/* global window */

import createRouter from 'unfancy-router/src/index'

import '../css/reset.less'
import '../css/markdown.less'
import '../fonts/iconfont.css'
import '@/nut-auto-generated-markdown-theme'
import '../css/override.less'

import nutConfig from '@/nut-auto-generated-nut-config'
import plugins from '@/nut-auto-generated-plugins'
import pages from '@/nut-auto-generated-pages'
import routes from '@/nut-auto-generated-routes'
import pluginOptions from '@/nut-auto-generated-plugin-options'
import extendContext from '@/nut-auto-generated-extend-context'

import applyPlugins from '../steps/apply-plugins'
import setupNico from '../steps/setup-nico'
import registerLayouts from '../steps/register-layouts'

import getFirstRoute from '../utils/get-first-route'
import switchTheme from '../utils/switch-theme'

import app from '@/nut-auto-generated-app'
import createAPI from '../context/api'
import events from '../context/events'
import use from '../context/use'

;( async function () {
  const routerOptions = nutConfig.router || {}
  const router = createRouter( routerOptions )

  const rootRouter = router.create( {
    name: '_',
    path: '',
  } )

  const globals = window.NUT_GLOBALS || {}

  const context = {
    ...extendContext(),
    env: process.env.NODE_ENV,
    plugins: {},
    app: nutConfig,
    api: createAPI( { pages, router: rootRouter, globals } ),
    events,
    pages,
    use,
    globals,
  }

  if ( nutConfig.sidebar ) {
    context.api.sidebar.configure( nutConfig.sidebar )
  }

  if ( nutConfig.homepage && ( typeof nutConfig.homepage === 'string' ) ) {
    context.api.homepage.set( nutConfig.homepage )
  }

  if ( routerOptions.cacheable && ( typeof routerOptions.cacheable === 'object' ) ) {
    Object.keys( routerOptions.cacheable )
      .forEach( page => {
        context.api.page( page ).set(
          'cacheable',
          Boolean( routerOptions.cacheable[ page ] )
        )
      } )
  }

  const nico = await setupNico(
    context,
    pluginOptions,
    routes,
    rootRouter,
    router
  )

  if ( routerOptions.alias ) {
    Object.keys( routerOptions.alias ).forEach( page => {
      const found = rootRouter.find( r => r.options.page === page )
      const alias = routerOptions.alias[ page ]
      if ( found && alias ) {
        found.alias( alias )
      }
    } )
  }

  await app( context )

  await registerLayouts( pluginOptions, context )

  await events.emit( 'system:before-apply-plugins', context )
  await applyPlugins( plugins, pluginOptions, context )
  await events.emit( 'system:after-apply-plugins', context )

  nico.on( 'notfound', () => {
    events.emit( 'route:notfound', context )
  } )

  await events.emit( 'system:before-startup', context )

  const homepage = context.api.homepage.get()

  if ( homepage ) {
    const router = rootRouter.find( r => r.options.page === homepage )
    if ( router ) {
      router.alias( '/' )
    }
  }

  nico.start( '#app' )
  events.emit( 'route:enabled', context )

  const matched = rootRouter.match()
  if ( !matched || ( matched.router === rootRouter ) ) {
    const homeMatched = rootRouter.match( '/' )

    if (
      homeMatched &&
      ( homeMatched.router !== rootRouter )
    ) {
      rootRouter.push( '/' )
    } else {
      const firstRoute = getFirstRoute( context )
      if ( firstRoute ) {
        rootRouter.push( firstRoute )
      }
    }
  }

  events.emit( 'system:after-startup', context )

  if ( module.hot ) {
    module.hot.accept(
      '@/nut-auto-generated-nut-config',
      function refreshTheme() {
        switchTheme( ( nutConfig && nutConfig.theme ) || 'ocean' )
        const mode = ( nutConfig && nutConfig.router && nutConfig.router.mode ) ||
          'hash'
        rootRouter.switchMode( mode )
      }
    )

    module.hot.accept( '@/nut-auto-generated-pages', () => {
      context.pages = pages
      context.api = createAPI( { pages, router: rootRouter } )
    } )
  }
} )()
