/* global window */

import createRouter from 'unfancy-router/src/index'

import '../css/reset.less'
import '../css/markdown.less'
import '../fonts/iconfont.css'
import '@/nut-auto-generated-markdown-theme'
import '../css/override.less'

import nutConfig from '@/nut-auto-generated-nut-config'
import modules from '@/nut-auto-generated-runtime-modules'
import pluginOptions from '@/nut-auto-generated-plugin-options'
import pages from '@/nut-auto-generated-pages'
import routes from '@/nut-auto-generated-routes'
import config from '@/nut-auto-generated-config'

import applyCompose from '../steps/apply-compose'
import applyModules from '../steps/apply-modules'
import setupNico from '../steps/setup-nico'

import getFirstRoute from '../utils/get-first-route'
import switchTheme from '../utils/switch-theme'
// fix __webpack_require__.e is not defined in dynamic build mode
import '../utils/add-require-ensure'
import dynamicBuild from '../utils/dynamic-build'
import logger from '../utils/logger'

import app from '@/nut-auto-generated-app'
import createAPI from '../context/api'
import events from '../context/events'
import use from '../context/use'

import none from '../modules/layout-none'

;( async function () {
  if ( nutConfig.compose ) {
    const composed = await applyCompose( nutConfig.compose )
    pages.push( ...composed.pages )
    routes.push( ...composed.routes )
  }

  const routerOptions = nutConfig.router || {}
  const router = createRouter( routerOptions )

  const rootRouter = router.create( {
    name: '_',
    path: '',
  } )

  const globals = window.NUT_GLOBALS || {}

  // add internal runtime module: layout none
  modules.unshift( [ 'builtin:layout-none', none, {} ] )

  const context = {
    config,
    env: process.env.NODE_ENV,
    app: nutConfig,
    api: createAPI( { pages, router: rootRouter, globals } ),
    pluginOptions,
    events,
    pages,
    globals,
    logger,
    ...use,
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
    routes,
    rootRouter,
    router,
    pluginOptions
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

  await applyModules( modules, context )

  await events.emit( 'system:before-app', context )
  await app( context )
  await events.emit( 'system:after-app', context )

  const homepage = context.api.homepage.get()

  if ( homepage ) {
    const router = rootRouter.find( r => r.options.page === homepage )
    if ( router ) {
      router.alias( '/' )
    }
  }

  nico.on( 'notfound', () => {
    events.emit( 'route:notfound', context )
  } )

  await events.emit( 'system:before-startup', context )

  const matched = rootRouter.match()
  const matchedPage = matched && matched.options && matched.options.page

  await dynamicBuild( matchedPage )

  nico.start( '#app' )
  events.emit( 'route:enabled', context )

  if ( !matched || ( matched.router === rootRouter ) ) {
    const homeMatched = rootRouter.match( '/' )

    if (
      homeMatched &&
      ( homeMatched.router !== rootRouter )
    ) {
      context.api.router.push( '/' )
    } else {
      const firstRoute = getFirstRoute( context )
      if ( firstRoute ) {
        context.api.router.push( firstRoute )
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
