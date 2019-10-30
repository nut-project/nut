/* global window */

import createRouter from 'unfancy-router/src/index'

import '../css/reset.less'
import '../css/markdown.less'
import '../fonts/iconfont.css'
import '#artifacts/markdownTheme.css'
import '../css/override.less'

import context from '#context'
import modules from '#artifacts/runtimeModules.js'
import config from '#artifacts/config.js'

import applyCompose from '../steps/apply-compose'
import applyModules from '../steps/apply-modules'
import setupNico from '../steps/setup-nico'

import getFirstRoute from '../utils/get-first-route'
import switchTheme from '../utils/switch-theme'
// fix __webpack_require__.e is not defined in dynamic build mode
import '../utils/add-require-ensure'
import dynamicBuild from '../utils/dynamic-build'
import logger from '../utils/logger'

import app from '#artifacts/appEntry.js'
import createAPI from '../context/api'

import none from '../modules/layout-none'

;( async function () {
  const { pages, routes, pluginOptions, events } = context

  if ( context.app.compose ) {
    const composed = await applyCompose( context.app.compose )
    pages.push( ...composed.pages )
    routes.push( ...composed.routes )
  }

  const routerOptions = context.app.router || {}
  const router = createRouter( routerOptions )

  const rootRouter = router.create( {
    name: '_',
    path: '',
  } )

  const globals = window.NUT_GLOBALS || {}

  // add internal runtime module: layout none
  modules.unshift( [ 'builtin:layout-none', none, {} ] )

  Object.assign( context, {
    env: process.env.NODE_ENV,
    api: createAPI( { pages, router: rootRouter, globals } ),
    config,
    globals,
    logger,
  } )

  if ( context.app.sidebar ) {
    context.api.sidebar.configure( context.app.sidebar )
  }

  if ( context.app.homepage && ( typeof context.app.homepage === 'string' ) ) {
    context.api.homepage.set( context.app.homepage )
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

  events.on( 'dev:hot-accept-app', app => {
    switchTheme( ( app && app.theme ) || 'ocean' )
    const mode = ( app && app.router && app.router.mode ) ||
      'hash'
    rootRouter.switchMode( mode )
  } )

  events.on( 'dev:hot-accept-pages', pages => {
    context.pages = pages
    context.api = createAPI( { pages, router: rootRouter } )
  } )
} )()
