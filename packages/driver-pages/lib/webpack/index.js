const path = require( 'path' )
const base = require( './base' )
const dev = require( './dev' )
const prod = require( './prod' )

const DEFAULTS = {
  browserslist: [ '>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9' ]
}

function tryRequirePackage( context ) {
  let pkg

  try {
    pkg = require( path.join( context, 'package.json' ) )
  } catch ( e ) {}

  return pkg
}

const ID = 'driver-pages:webpack'

module.exports = function ( api ) {
  api.hooks.chainWebpack.tapPromise( ID, async () => {
    const pkg = tryRequirePackage( process.cwd() )

    const browserslist = api.config.browserslist ||
      ( pkg && pkg.browserslist ) ||
      DEFAULTS.browserslist

    let transpileModules = (
      api.config.babel && api.config.babel.transpileModules
    ) || []

    // clone
    transpileModules = transpileModules.slice()

    if ( api.config && api.config.plugins ) {
      api.config.plugins.forEach( plugin => {
        const pkg = tryRequirePackage( plugin.context )

        if ( pkg ) {
          transpileModules.push( pkg.name )
        } else {
          transpileModules.push( function ( filepath ) {
            return filepath.includes( plugin.context )
          } )
        }
      } )
    }

    const exclude = [
      /\.nut\/pages\.js/,
      /\.nut\/routes\.js/,
      /\.nut\/route-components\//,
    ]

    const includeCaches = {}

    // from egoist/poi
    function include( filepath ) {
      filepath = filepath.replace( /\\/g, '/' )

      // use cache
      if ( typeof includeCaches[ filepath ] === 'boolean' ) {
        return includeCaches[ filepath ]
      }

      if ( !filepath.includes( 'node_modules' ) ) {
        includeCaches[ filepath ] = true
        return true
      }

      if ( transpileModules ) {
        const shouldTranspile = transpileModules.some( m => {
          if ( typeof m === 'string' ) {
            return filepath.includes( `/node_modules/${ m }/` ) ||
              filepath.includes( `/node_modules/_${ m.replace( /\//g, '_' ) }` )
          }

          if ( typeof m === 'function' ) {
            return m( filepath )
          }

          if ( m && m.test ) {
            return m.test( filepath )
          }

          return false
        } )

        includeCaches[ filepath ] = shouldTranspile
        return shouldTranspile
      }

      includeCaches[ filepath ] = false
      return false
    }

    const options = {
      browserslist,
      include,
      exclude,
      clean: api.config.output && api.config.output.clean === true,
      publicPath: api.config.output && api.config.output.publicPath,
    }

    base( api.webpack, options )

    if ( api.env === 'production' ) {
      prod( api.webpack, options )
    } else {
      dev( api.webpack, options )
    }
  } )
}
