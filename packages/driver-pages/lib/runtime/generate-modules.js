const path = require( 'path' )
const fse = require( 'fs-extra' )
const { utils } = require( '@nut-project/core' )
const { toRelativePath } = require( './utils' )
const filterPlugins = require( './filter-plugins' )

const dirs = {
  project: process.cwd()
}

async function generateModules( artifacts = {}, options = {} ) {
  const { config } = artifacts
  let { pages } = artifacts

  const {
    env = 'development',
    cliOptions = {},
    dynamicPages = [],
    lockedDynamicPages = [],
    skipDiff = false,
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

  const modules = {
    'src/nut-auto-generated-pages.js': await generatePages( env, pages ),
    'src/nut-auto-generated-routes.js': routes.source,
    'src/nut-auto-generated-plugins.js': await generatePlugins( config, { env } ),
    'src/nut-auto-generated-plugin-options.js': await generatePluginOptions( config, { env } ),
    'src/nut-auto-generated-config.js': await generateConfig( config, { env } ),
    'src/nut-auto-generated-nut-config.js': await generateNutConfig( config ),
    'src/nut-auto-generated-markdown-theme.css': await generateMarkdownThemeCSS( config ),
    [ `src/nut-auto-generated-app${ app.extension }` ]: app.content,
    ...routes.files,
  }

  if ( skipDiff === true ) {
    addModulesCache( modules )
    return modules
  }

  const diffed = diff( modules )
  addModulesCache( modules )
  return diffed
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

function addModulesCache( modules ) {
  Object.keys( modules )
    .forEach( key => {
      modulesHistory[ key ] = modules[ key ]
    } )
}

function diff( modules ) {
  return Object.keys( modules )
    .filter( key => modules[ key ] !== modulesHistory[ key ] )
    .reduce( ( total, key ) => {
      total[ key ] = modules[ key ]
      return total
    }, {} )
}

async function generatePages( env, pages ) {
  // for security purpose, remove filepath
  if ( env === 'production' ) {
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

function shortenEnv( env ) {
  const map = {
    development: 'dev',
    production: 'prod',
  }
  return map[ env ] || 'dev'
}

async function generateConfig( config, { env } = {} ) {
  env = shortenEnv( env )

  let files = await utils.globby( [
    'config/config.*.js'
  ] )

  files = files.filter(
    file => file.includes( `.default.` ) || file.includes( `.${ env }.` )
  )

  const merged = await utils.merge( files.reduce( ( total, file ) => {
    total.push( require( file ) )
    return total
  }, [] ) )

  return JSON.stringify( merged )
}

async function generatePluginOptions( config, { env } = {} ) {
  env = shortenEnv( env )

  let files = await utils.globby( [
    `config/plugin.*.js`
  ] )

  files = files.filter(
    file => file.includes( `.default.` ) || file.includes( `.${ env }.` )
  )

  const merged = await utils.merge( files.reduce( ( total, file ) => {
    total.push( require( file ) )
    return total
  }, [] ) )

  return JSON.stringify( merged )
}

async function generatePlugins( config, { env } = {} ) {
  const plugins = filterPlugins( config.plugins, {
    file: 'pages.browser.js',
    env
  } )

  const _imports = plugins.map( ( plugin, index ) => {
    const importPath = plugin.path ?
      toRelativePath( path.join( plugin.path, 'pages.browser.js' ) ) :
      plugin.package + '/pages.browser.js'
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
          return import( /* webpackChunkName: ${ JSON.stringify( page.name ) } */ '${ toRelativePath( page.filepath ) }' )
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
          return import( /* webpackChunkName: ${ JSON.stringify( page.name ) } */ '${ toRelativePath( page.filepath ) }' )
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
