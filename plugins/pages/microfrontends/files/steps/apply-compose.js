/* global window, document */

// composeConfig can be fetched from remote
export default async composeConfig => {
  const collections = []
  const manifests = []

  if ( composeConfig ) {
    window.nutJsonp = function ( { pages, config, routes } = {}, dataset = {} ) {
      const { name: composeName } = dataset

      const manifest = manifests.find( m => {
        return m.name === composeName
      } )

      if ( manifest ) {
        const { id, name, prefix, publicPath } = manifest

        collections.push( {
          id,
          name,
          prefix,
          publicPath,
          pages,
          config,
          routes
        } )
      }
    }

    window.nutManifestJSONP = function ( { files = [], id, publicPath = '/' } = {}, dataset = {} ) {
      // name -> manifest
      const { name } = dataset
      manifests.push( {
        name,
        base: composeConfig[ name ].service,
        prefix: composeConfig[ name ].prefix,
        files,
        id,
        publicPath,
      } )
    }

    const jobs = Object.keys( composeConfig ).map( name => {
      return loadJs( composeConfig[ name ].service + '/manifest.js?t=' + new Date().getTime(), {
        name,
      } )
    } )

    await Promise.all( jobs )
  }

  const { pages, routes } = collections.reduce( ( total, c ) => {
    const prefix = c.prefix
    const name = c.name
    const id = c.id
    const publicPath = c.publicPath

    const pages = c.pages.map( page => {
      return Object.assign( {}, page, {
        compose: { id, name, publicPath },
        name: name + '$' + page.name,
        page: name + '/' + page.page,
        route: prefix + page.route,
      } )
    } )

    const routes = c.routes.map( route => {
      return Object.assign( {}, route, {
        compose: { id, name, publicPath },
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

  return {
    pages,
    routes,
  }
}

function loadJs( url, dataset ) {
  return new Promise( ( resolve, reject ) => {
    const script = document.createElement( 'script' )
    script.charset = 'utf-8'
    if ( dataset ) {
      Object.keys( dataset ).forEach( k => {
        script.dataset[ k ] = dataset[ k ]
      } )
    }
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
