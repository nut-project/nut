import './css/reset.less'
import './css/nprogress.less'
import './css/markdown.less'
import './fonts/iconfont.css'
import 'nut-auto-generated-markdown-theme'
import './css/override.less'

import nutConfig from 'nut-auto-generated-nut-config'
import plugins from 'nut-auto-generated-plugins'

import installDirectives from './steps/install-directives'
import applyPlugins from './steps/apply-plugins'
import setupNProgress from './steps/setup-nprogress'
import setupNico from './steps/setup-nico'

import getFirstRoute from './utils/get-first-route'
import switchTheme from './utils/switch-theme'

import app from '@/app.js'
import events from './events'
import api from './api'

;( async function () {
  const context = {
    env: process.env.NODE_ENV,
    plugins,
    app: nutConfig,
    config: {},
  }

  await events.emit( 'system:before-startup', context )
  await app( context )

  await installDirectives()

  await events.emit( 'system:before-apply-plugins', context )
  await applyPlugins( plugins, { api, events } )
  await events.emit( 'system:after-apply-plugins', context )

  const nico = await setupNico()
  await setupNProgress( nico )

  nico.on( 'notfound', () => {
    events.emit( 'route:404', context )
  } )

  nico.on( 'layout', function ( { layout, router } ) {
    // TODO: 计算page和pages，以及添加nutconfig上的active属性
    layout.data.ctx = {
      ...context,
      app: nutConfig,
      config: {},
      router,
    }

    console.log( context )

    layout.$update()

    switchTheme( nutConfig && nutConfig.theme || 'ocean' )
  } )

  nico.start( '#app' )

  events.emit( 'route:enabled', context )

  if ( !location.hash ) {
    const firstRoute = getFirstRoute( nutConfig )
    if ( firstRoute ) {
      location.href = '#' + firstRoute
    }
  }

  events.emit( 'system:after-startup', context )

  if ( module.hot ) {
    module.hot.accept( 'nut-auto-generated-nut-config', () => {
      if ( nico.layout ) {
        nico.layout.data.ctx.app = nutConfig
        nico.layout.$update()
      }
      switchTheme( nutConfig && nutConfig.theme || 'ocean' )
    } )
  }
} )()
