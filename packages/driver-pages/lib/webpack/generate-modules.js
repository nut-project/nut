const path = require( 'path' )
const fse = require( 'fs-extra' )
const { utils } = require( '@nut-project/core' )
const dirs = require( '../utils/dirs' )
const pathUtils = require( '../utils/path-utils' )

async function generateModules( artifacts = {}, options = {} ) {
  const { config } = artifacts
  let { pages } = artifacts

  const {
    env = 'dev',
    cliOptions = {},
    dynamicPages = [],
    lockedDynamicPages = [],
  } = options

  addRouteForPages( pages )

  if ( cliOptions.singlePage ) {
    pages = pages.filter( page => {
      return page.page === cliOptions.singlePage
    } )
  }

  const routes = await generateRoutes(
    pages,
    cliOptions.dynamic,
    cliOptions.dynamic ? dynamicPages : null,
    lockedDynamicPages,
  )
  const app = await generateAppContent()

  return diff( {
    'src/nut-auto-generated-pages.js': await generatePages( env, pages ),
    'src/nut-auto-generated-routes.js': routes.source,
    'src/nut-auto-generated-plugins.js': await generatePlugins( config, { env } ),
    'src/nut-auto-generated-plugin-options.js': await generatePluginOptions( config, { env } ),
    'src/nut-auto-generated-config.js': await generateConfig( config, { env } ),
    'src/nut-auto-generated-nut-config.js': await generateNutConfig( config ),
    'src/nut-auto-generated-markdown-theme.css': await generateMarkdownThemeCSS( config ),
    [ `src/nut-auto-generated-app${ app.extension }` ]: app.content,
    ...routes.files,
  } )
}

function addRouteForPages( pages ) {
  pages.forEach( page => {
    page.route = '/' + page.page.replace( /(\/_)(.+)/g, '/:$2' )

    if ( page.provider === 'plugin' ) {
      page.route = page.route + '@' + page.plugin
    }
  } )

  return pages
}

const modulesHistory = {}

function diff( modules ) {
  return Object.keys( modules )
    .filter( key => {
      const isEqual = modules[ key ] !== modulesHistory[ key ]
      modulesHistory[ key ] = modules[ key ]
      return isEqual
    } )
    .reduce( ( total, key ) => {
      total[ key ] = modules[ key ]
      return total
    }, {} )
}

async function generatePages( env, pages ) {
  // for security purpose, remove filepath
  if ( env === 'prod' ) {
    pages = pages.map( page => {
      const tmp = {}
      Object.keys( page ).forEach( key => {
        if ( key !== 'filepath' ) {
          tmp[ key ] = page[ key ]
        }
      } )
      return tmp
    } )
  }

  return `export default ${ JSON.stringify( pages ) }`
}

async function generateNutConfig( config ) {
  const picked = utils.pick( config, [
    'zh',
    'en',
    'logo',
    'sidebar',
    'layout',
    'theme',
    'compose',
    'router',
    'homepage',
  ] )

  return `export default ${ JSON.stringify( picked ) }`
}

async function generateAppContent() {
  const appFiles = [
    path.join( dirs.project, 'src/app.js' ),
    path.join( dirs.project, 'src/app.ts' ),
  ]

  for ( const file of appFiles ) {
    if ( await fse.pathExists( file ) ) {
      return {
        extension: path.extname( file ),
        content: await readFile( file )
      }
    }
  }

  return {
    extension: '.js',
    content: `export default function () {}`
  }
}

async function generateConfig( config, { env } = {} ) {
  let files = await utils.globby( [
    'config/config.*.js'
  ] )

  files = files.filter(
    file => file.includes( `.default.` ) || file.includes( `.${ env }.` )
  )

  return await utils.mergeFiles( files )
}

async function generatePluginOptions( config, { env } = {} ) {
  let files = await utils.globby( [
    `config/plugin.*.js`
  ] )

  files = files.filter(
    file => file.includes( `.default.` ) || file.includes( `.${ env }.` )
  )

  return await utils.mergeFiles( files )
}

async function generatePlugins( config, { env } = {} ) {
  const pluginsObj = config.plugins || {}

  let plugins = Object.keys( pluginsObj )
    .map( localName => ( {
      localName,
      ...pluginsObj[ localName ],
    } ) )

  // filter valid .path / .package
  plugins = plugins.filter( plugin => ( plugin.path || plugin.package ) )
  // filter enable
  plugins = plugins.filter( plugin => plugin.enable )
  // filter env
  plugins = plugins.filter( plugin => ~plugin.env.indexOf( env ) )

  const _imports = plugins.map( ( plugin, index ) => {
    const importPath = plugin.path ? pathUtils.toRelative( plugin.path ) : plugin.package
    return `import plugin_${ index } from '${ importPath }';`
  } ).join( '\n' )

  const _localnames = plugins.map( ( plugin, index ) => {
    return `plugin_${ index }.localName = ${ JSON.stringify( plugin.localName ) }`
  } ).join( '\n' )

  const _exports = `export default [
    ${ plugins.map( ( plugin, index ) => `plugin_${ index }` ).join( ',' ) }
  ]`

  return `
    ${ _imports }
    ${ _localnames }
    ${ _exports }
  `
}

async function generateMarkdownThemeCSS( config ) {
  const DEFAULT_THEME = 'prism-tomorrow'
  const theme = ( config.markdown && config.markdown.theme ) || DEFAULT_THEME

  // prefer internal themes
  const themePath = path.join( __dirname, `../markdown/themes/${ theme }.css` )
  if ( await fse.pathExists( themePath ) ) {
    return await readFile( themePath )
  }

  // fallback to theme packages
  const themePackages = [ 'prismjs', 'prism-themes' ]
  const themePaths = themePackages
    .map( pkgName => getPrismThemePath( pkgName, theme ) )
    .filter( Boolean )

  for ( const p of themePaths ) {
    if ( await fse.pathExists( p ) ) {
      return await readFile( p )
    }
  }

  return ''
}

async function readFile( filepath ) {
  const buffer = await fse.readFile( filepath, 'utf8' )
  return buffer.toString()
}

function getPrismThemePath( pkg, theme ) {
  try {
    const root = getPackageRoot( pkg )
    return path.join( root, `themes/${ theme }.css` )
  } catch ( e ) {
    return ''
  }
}

function getPackageRoot( pkg ) {
  return path.dirname( require.resolve( `${ pkg }/package.json` ) )
}

async function generateRoutes( pages, dynamic, dynamicPages, lockedDynamicPages ) {
  const routes = pages
    .map( page => `{
      name: '${ page.name }',
      path: '${ page.route }',
      page: ${ JSON.stringify( page.page ) },
      extension: ${ JSON.stringify( page.extension ) },
      component: ${ page.name },
      provider: ${ JSON.stringify( page.provider ) },
      plugin: ${ JSON.stringify( page.plugin ) },
    }` ).join( ',\n' )

  const declarations = []
  const HMRs = []
  const files = {}

  pages.forEach( page => {
    const builtBefore = lockedDynamicPages.includes( page.page )

    if ( !builtBefore ) {
      HMRs.push( `
        function ${ page.name }_accept() {
          routes.find( function ( route ) {
            if ( route.name === ${ JSON.stringify( page.name ) } ) {
              route.component = ${ page.name }
            }
          } )

          const key = Object.keys( module.hot._acceptedDependencies )
            .find( function ( dep ) {
              return !!~dep.indexOf( '/${ page.name }.js' )
            } )

          if ( key ) {
            delete module.hot._acceptedDependencies[ key ]
          }
        }

        module.hot.accept(
          '@/nut-auto-generated-route-components/${ page.name }.js',
          ${ page.name }_accept
        )
      ` )
    }

    if ( dynamic ) {
      const filename = `nut-auto-generated-route-components/${ page.name }.js`

      declarations.push( `
        import ${ page.name } from '@/${ filename }'
      ` )

      let content = `
        export default function () {
          return import( /* webpackChunkName: ${ JSON.stringify( page.name ) } */ '${ pathUtils.toRelative( page.filepath ) }' )
        }
      `

      if ( dynamicPages && !dynamicPages.includes( page.page ) ) {
        content = `
          export default function () {
            return Promise.resolve( {} )
          }
        `
      }
      files[ `src/${ filename }` ] = content
    } else {
      declarations.push( `
        function ${ page.name }() {
          return import( /* webpackChunkName: ${ JSON.stringify( page.name ) } */ '${ pathUtils.toRelative( page.filepath ) }' )
        }
      ` )
    }
  } )

  return {
    source: `
      ${ declarations.join( '\n' ) }

      var routes = [
        ${ routes }
      ];

      ${ dynamic ? `if ( module.hot ) { ${ HMRs.join( '' ) } }` : `` }

      export default routes;
    `,
    files,
  }
}

module.exports = generateModules
