/* global window, document */

import context from '#context'

if ( window.nutJsonp ) {
  const { pages, app: config, routes } = context
  const currentScript = document.currentScript
  const dataset = currentScript ? currentScript.dataset : {}

  window.nutJsonp( {
    pages,
    config,
    routes,
  }, dataset )
}
