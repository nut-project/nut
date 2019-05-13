import './css/reset.less'
import './css/nprogress.less'
import './css/markdown.less'
import './fonts/iconfont.css'
import 'nut-auto-generated-markdown-theme'
import './css/override.less'

import nutConfig from 'nut-auto-generated-nut-config'
import plugins from 'nut-auto-generated-plugins'
import pages from 'nut-auto-generated-pages'
import pluginOptions from 'nut-auto-generated-plugin-options'
import extendContext from 'nut-auto-generated-extend-context'

import applyPlugins from './steps/apply-plugins'
import setupNProgress from './steps/setup-nprogress'
import setupNico from './steps/setup-nico'
import registerLayouts from './steps/register-layouts'

import getFirstRoute from './utils/get-first-route'
import switchTheme from './utils/switch-theme'

import app from '@/nut-auto-generated-app'
import events from './events'
import createAPI from './api'
import use from './use'
import router from './router'

;( async function () {
  const context = {
    ...extendContext(),
    env: process.env.NODE_ENV,
    plugins: {},
    app: nutConfig,
    api: createAPI( { pages } ),
    events,
    pages,
    use,
    router,
    globals: NUT_GLOBALS || {},
  }

  if ( nutConfig.sidebar ) {
    context.api.configureSidebar( nutConfig.sidebar )
  }

  await app( context )

  await registerLayouts( context )

  await events.emit( 'system:before-apply-plugins', context )
  await applyPlugins( plugins, pluginOptions, context )
  await events.emit( 'system:after-apply-plugins', context )

  const nico = await setupNico( context, pluginOptions )
  await setupNProgress( nico )

  nico.on( 'notfound', () => {
    events.emit( 'route:notfound', context )
  } )

  await events.emit( 'system:before-startup', context )

  if ( !location.hash ) {
    const firstRoute = getFirstRoute( context )
    if ( firstRoute ) {
      location.replace( '#' + firstRoute )
    }
  }

  nico.start( '#app' )

  events.emit( 'route:enabled', context )

  events.emit( 'system:after-startup', context )

  if ( module.hot ) {
    module.hot.accept( 'nut-auto-generated-nut-config', function refreshTheme(  ) {
      switchTheme( nutConfig && nutConfig.theme || 'ocean' )
    } )

    module.hot.accept( 'nut-auto-generated-pages', () => {
      context.pages = pages
      context.api = createAPI( { pages } )
    } )
  }
} )()
