const path = require( 'path' )
const fse = require( 'fs-extra' )
const tildify = require( 'tildify' )
const globby = require( 'globby' )

const dirs = require( './dirs' )
const getPages = require( './get-pages' )
const pathUtils = require( './path-utils' )

async function generateVirtualModules(
  config,
  {
    env = 'dev',
    cliOptions = {},
    dynamicPages = [],
    lockedDynamicPages = [],
  } = {},
) {
  const pages = await getPages( config, { cliOptions } )
  const nutConfig = await generateNutConfig( config )
  const routes = await generateRoutes(
    pages,
    cliOptions.dynamic ? dynamicPages : null,
    lockedDynamicPages,
  )
  const plugins = await generatePlugins( config, { env } )
  const pluginOptions = await generatePluginOptions( config, { env } )
  const markdownThemeCSS = await generateMarkdownThemeCSS( config )
  const extendContext = await generateExtendContext( config, { env } )
  const app = await generateAppContent()

  return diff( {
    'src/nut-auto-generated-pages.js': `export default ${ JSON.stringify( pages ) }`,
    'src/nut-auto-generated-routes.js': routes.source,
    'src/nut-auto-generated-plugins.js': plugins,
    'src/nut-auto-generated-plugin-options.js': pluginOptions,
    'src/nut-auto-generated-extend-context.js': extendContext,
    'src/nut-auto-generated-nut-config.js': nutConfig,
    'src/nut-auto-generated-markdown-theme.css': markdownThemeCSS,
    [ `src/nut-auto-generated-app${ app.extension }` ]: app.content,
    ...routes.files,
  } )
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

async function generateNutConfig( config ) {
  const output = [
    'zh',
    'en',
    'logo',
    'sidebar',
    'layout',
    'theme',
    'compose',
    'router',
    'homepage',
  ].map( key => {
    return `"${ key }": ${ JSON.stringify( config[ key ] ) }`
  } )

  return `export default {
    ${ output.join( ',\n' ) }
  }`
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

async function generateExtendContext( config, { env } = {} ) {
  const root = path.join( __dirname, '../context' )
  const files = await globby( [
    '*.js'
  ], {
    cwd: root,
    onlyFiles: true,
    deep: Infinity,
    absolute: true,
  } )

  const promises = files.map( async ( file, index ) => {
    const fn = require( file )
    const key = path.basename( file, path.extname( file ) )
    const variable = 'context_' + index

    const runtimePath = await fn( config, { env } )

    if ( !runtimePath ) {
      return
    }

    return {
      statement: `import ${ variable } from '${ runtimePath }';`,
      key,
      variable,
    }
  } )

  let _imports = await Promise.all( promises )

  _imports = _imports.filter( Boolean )

  const pairs = _imports.map( imp => {
    return imp.key + ': ' + imp.variable + ','
  } )

  return `
    ${ _imports.map( imp => imp.statement ).join( '' ) }
    export default function () {
      return {
        ${ pairs.join( '' ) }
      }
    }
  `
}

async function getPluginOptionsFilePath( env ) {
  const cwd = process.cwd()

  const file = 'config/plugin.' + env + '.js'

  const exists = await fse.pathExists( path.join( cwd, 'src/' + file ) )

  if ( !exists ) {
    return
  }

  return `@/${ file }`
}

async function generatePluginOptions( config, { env } = {} ) {
  const filepath = await getPluginOptionsFilePath( env )

  if ( filepath ) {
    return `
      export { default } from '${ filepath }'
    `
  }

  return `export default {}`
}

async function generatePlugins( config, { env } = {} ) {
  const pluginsObj = config.plugins || {}

  let plugins = Object.keys( pluginsObj )
    .map( localName => ( {
      localName,
      ...pluginsObj[ localName ],
    } ) )
    .map( normalizePlugin )

  // filter truthy
  plugins = plugins.filter( Boolean )
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

function normalizePlugin( plugin ) {
  plugin.env = plugin.env || [ 'dev', 'prod' ]
  // eslint-disable-next-line
  plugin.enable = typeof plugin.enable !== 'undefined' ?
    Boolean( plugin.enable ) :
    true

  return plugin
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

async function generateRoutes( pages, dynamicPages, lockedDynamicPages ) {
  const routes = pages
    .map( page => `{
      name: '${ page.name }',
      path: '${ page.route }',
      page: ${ JSON.stringify( page.page ) },
      filepath: ${ JSON.stringify( tildify( page.filepath ) ) },
      component: ${ page.name },
      provider: '${ page.provider }',
      plugin: '${ page.plugin }',
    }` ).join( ',\n' )

  const imports = []
  const HMRs = []
  const files = {}

  pages.forEach( page => {
    imports.push( `
      import ${ page.name } from '@/nut-auto-generated-route-components/${ page.name }.js'
    ` )

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

    const filename = `src/nut-auto-generated-route-components/${ page.name }.js`
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
    files[ filename ] = content
  } )

  return {
    source: `
      ${ imports.join( '' ) }

      var routes = [
        ${ routes }
      ];

      ${
  dynamicPages ? `
          if ( module.hot ) {
            ${ HMRs.join( '' ) }
          }` : ``
}

      export default routes;
    `,
    files,
  }
}

module.exports = generateVirtualModules
