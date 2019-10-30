import app from '#artifacts/app'
import pages from '#artifacts/pages'
import routes from '#artifacts/routes'
import pluginOptions from '#artifacts/pluginOptions'
import events from './events'
import exposeUse from './expose-use'

const context = {
  app,
  pages,
  routes,
  events,
  ...exposeUse,
}

if ( module.hot ) {
  module.hot.accept( '#artifacts/app', () => {
    events.emit( 'dev:hot-accept-app', app )
  } )
  module.hot.accept( '#artifacts/pages', () => {
    events.emit( 'dev:hot-accept-pages', pages )
  } )
  module.hot.accept( '#artifacts/routes', () => {
    events.emit( 'dev:hot-accept-routes', routes )
  } )
  module.hot.accept( '#artifacts/pluginOptions', () => {
    events.emit( 'dev:hot-accept-pluginOptions', pluginOptions )
  } )
}

export default context
