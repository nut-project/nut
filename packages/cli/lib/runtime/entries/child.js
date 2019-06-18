/* global window */

import pages from '@/nut-auto-generated-pages'
import config from '@/nut-auto-generated-nut-config'
import routes from '@/nut-auto-generated-routes'

if ( window.nutJsonp ) {
  window.nutJsonp( {
    pages,
    config,
    routes,
  } )
}
