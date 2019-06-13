import Router from 'unfancy-router/src/index'

import '../css/reset.less'
import '../css/markdown.less'
import '../fonts/iconfont.css'
import '@/nut-auto-generated-markdown-theme'
import '../css/override.less'

import nutConfig from '@/nut-auto-generated-nut-config'
import plugins from '@/nut-auto-generated-plugins'
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

import axios from 'axios'

;( async function () {
  const compose = nutConfig.compose
  const collection = []

  if ( compose ) {
    function filterJs( files ) {
      return files.filter( file => file.endsWith( '.js' ) )
    }

    const jobs = Object.keys( compose ).map( name => {
      return axios.get( compose[ name ].service + '/manifest.json' )
        .then( response => {
          return response.data
        } )
        .then( json => {
          return {
            name: name,
            base: compose[ name ].service,
            prefix: compose[ name ].prefix,
            files: json.files,
          }
        } )
    } )

    function loadJs( url ) {
      return new Promise( ( resolve, reject ) => {
        const script = document.createElement( 'script' )
        script.charset = 'utf-8'
        script.src = url
        script.onload = function () {
          script.onload = null
          script.onerror = null
          document.body.removeChild( script )
          resolve()
        }
        script.onerror = function () {
          reject()
        }

        document.body.appendChild( script )
      } )
    }

    function loadChild( child ) {
      const name = child.name
      const prefix = child.prefix

      return child.files.reduce( ( total, file, index ) => {
        return total.then( () => {
          window.nutJsonp = function ( { pages, config, routes } = {} ) {
            collection.push( {
              name,
              prefix,
              pages,
              config,
              routes
            } )
          }

          return loadJs( child.base + '/' + file )
        } )
      }, Promise.resolve() )
    }

    await Promise.all( jobs )
      .then( children => {
        return children.reduce( ( total, child ) => {
          return total.then( () => loadChild( child ) )
        }, Promise.resolve() )
      } )
  }

  const { pages, routes } = collection.reduce( ( total, c ) => {
    const prefix = c.prefix
    const name = c.name

    const pages = c.pages.map( page => {
      return Object.assign( {}, page, {
        name: name + '$' + page.name,
        page: name + '/' + page.page,
        route: prefix + page.route,
      } )
    } )

    const routes = c.routes.map( route => {
      return Object.assign( {}, route, {
        name: name + '$' + route.name,
        page: name + '/' + route.page,
        path: prefix + route.path,
      } )
    } )

    total.pages.push( ...pages )
    total.routes.push( ...routes )

    return total
  }, {
    pages: [],
    routes: [],
  } )

  const routerOptions = nutConfig.router || {}
  const router = Router( routerOptions )

  const rootRouter = router.create( {
    name: '_',
    path: '',
  } )

  const context = {
    ...extendContext(),
    env: process.env.NODE_ENV,
    plugins,
    app: nutConfig,
    api: createAPI( { pages, router: rootRouter } ),
    events,
    pages,
    use,
    globals: window.NUT_GLOBALS || {},
  }

  if ( nutConfig.sidebar ) {
    context.api.sidebar.configure( nutConfig.sidebar )
  }

  if ( typeof nutConfig.homepage === 'string' ) {
    ctx.api.homepage.set( nutConfig.homepage )
  }

  if ( routerOptions.cacheable && ( typeof routerOptions.cacheable === 'object' ) ) {
    Object.keys( routerOptions.cacheable )
      .forEach( page => {
        context.api.page( page ).set( 'cacheable', !!routerOptions.cacheable[ page ] )
      } )
  }

  const nico = await setupNico( context, pluginOptions, routes, rootRouter, router )

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

  await registerLayouts( context )

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
    module.hot.accept( '@/nut-auto-generated-nut-config', function refreshTheme(  ) {
      switchTheme( nutConfig && nutConfig.theme || 'ocean' )
    } )
  }
} )()
