/* global window, document */

import pages from '@/nut-auto-generated-pages'
import config from '@/nut-auto-generated-nut-config'
import routes from '@/nut-auto-generated-routes'

if ( window.nutJsonp ) {
  const currentScript = document.currentScript
  const dataset = currentScript ? currentScript.dataset : {}

  window.nutJsonp( {
    pages,
    config,
    routes,
  }, dataset )
}
