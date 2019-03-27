import Router from 'unfancy-router'
import Regular from 'regularjs'
import NProgress from 'nprogress'

import Tippy from './regular-plugins/tippy'
import createNico from './core/router'
import './css/global.less'
import './css/nprogress.less'
import './css/markdown.less'
import './fonts/iconfont.css'

import routes from 'nut-auto-generated-routes'
import nutConfig from 'nut-auto-generated-nut-config'
import app from '@/app.js'

Regular.use( Tippy )

const PROGRESS_CONTAINER_ID = 'progress-container'

NProgress.configure( {
  parent: '#' + PROGRESS_CONTAINER_ID
} )

const router = Router()

const root = router.create( {
  name: '_',
  path: '',
} )

const nico = createNico( root, router )

nico.beforeEach( () => {
  const parent = document.getElementById( PROGRESS_CONTAINER_ID )
  if ( !parent ) {
    return
  }
  NProgress.start()
} )

nico.afterEach( () => {
  const parent = document.getElementById( PROGRESS_CONTAINER_ID )
  if ( !parent ) {
    return
  }
  NProgress.done()
} )

nico.define( routes )

if ( module.hot ) {
  module.hot.accept( 'nut-auto-generated-nut-config', () => {
    if ( nico.layout ) {
      nico.layout.data.ctx.app = nutConfig
      nico.layout.$update()

      switchTheme( nutConfig && nutConfig.theme || 'ocean' )
    }
  } )
}

function switchTheme( theme ) {
  switch ( theme ) {
    case 'ocean':
      document.documentElement.style.setProperty('--primary-color', '#79bef6')
      document.documentElement.style.setProperty('--primary-color-dark', '#568ffd')
      break
    case 'sakura':
      document.documentElement.style.setProperty('--primary-color', '#f67995')
      document.documentElement.style.setProperty('--primary-color-dark', '#ff6a8b')
      break
  }
}

function getFirstRoute( config ) {
  let found

  const sidebar = config.sidebar

  sidebar.some( s => {
    const pages = s.pages

    return pages.some( page => {
      if ( !page.hidden ) {
        found = page
        return true
      }

      return false
    } )
  } )

  if ( !found ) {
    return
  }

  return found.route
}

const context = {}

app( context )
  .then( () => {
    nico.on( 'notfound', () => {
      location.replace( '#/404' )
    } )

    nico.on( 'layout', function ( { layout, router } ) {
      layout.data.ctx = {
        ...context,
        app: nutConfig,
        config: {},
        router,
      }

      layout.$update()

      switchTheme( nutConfig && nutConfig.theme || 'ocean' )
    } )

    nico.start( '#app' )

    if ( !location.hash ) {
      const firstRoute = getFirstRoute( nutConfig )
      if ( firstRoute ) {
        location.href = '#' + firstRoute
      }
    }
  } )
