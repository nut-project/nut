const path = require( 'path' )
const fse = require( 'fs-extra' )
const tildify = require( 'tildify' )
const globby = require( 'globby' )

const dirs = require( './dirs' )
const getPages = require( './get-pages' )
const pathUtils = require( './path-utils' )

async function generateVirtualModules( config, { env = 'dev' } = {} ) {
  const pages = await getPages( config )
  const nutConfig = await generateNutConfig( config )
  const routes = await generateRoutes( pages )
  const plugins = await generatePlugins( config, { env } )
  const pluginOptions = await generatePluginOptions( config, { env } )
  const markdownThemeCSS = await generateMarkdownThemeCSS( config )
  const extendContext = await generateExtendContext( config, { env } )
  const appContent = await generateAppContent()

  return diff( {
    'src/nut-auto-generated-pages.js': `export default ${ JSON.stringify( pages ) }`,
    'src/nut-auto-generated-routes.js': routes,
    'src/nut-auto-generated-plugins.js': plugins,
    'src/nut-auto-generated-plugin-options.js': pluginOptions,
    'src/nut-auto-generated-extend-context.js': extendContext,
    'src/nut-auto-generated-nut-config.js': nutConfig,
    'src/nut-auto-generated-markdown-theme.css': markdownThemeCSS,
    'src/nut-auto-generated-app.js': appContent,
  } )
}

const modulesHistory = {}

function diff( modules ) {
  return Object.keys( modules )
    .filter( key => {
      const isEqual = modules[ key ] !== modulesHistory[ key ]
      modulesHistory[ key ] = modulesHistory[ key ]
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
  const appFile = path.join( dirs.project, 'src/app.js' )
  if ( await fse.pathExists( appFile ) ) {
    const buffer = await fse.readFile( appFile, 'utf8' )
    return buffer.toString()
  }

  return `
    export default function () {}
  `
}

async function generateExtendContext( config, { env } = {} ) {
  const root = path.join( __dirname, '../context' )
  const files = await globby( [
    '*.js'
  ], {
    cwd: root,
    onlyFiles: true,
    deep: 0,
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

  const pairs = _imports.map( ( imp ) => {
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
    ${
      plugins
        .map( ( plugin, index ) => `plugin_${ index }` )
        .join( ',' )
    }
  ]`

  return `
    ${ _imports }
    ${ _localnames }
    ${ _exports }
  `
}

function normalizePlugin( plugin ) {
  plugin.env = plugin.env || [ 'dev', 'prod' ]
  plugin.enable = typeof plugin.enable !== 'undefined' ?
    !!plugin.enable :
    true

  return plugin
}

async function generateMarkdownThemeCSS( config ) {
  const lookupStartPath = path.join( dirs.cli, 'node_modules' )
  const theme = ( config.markdown && config.markdown.theme ) || 'prism-tomorrow'
  const root = path.dirname( require.resolve( 'prismjs/package.json' ) )
  const request = 'themes/' + theme + '.css'
  const cssPath = path.join( root, request )

  if ( await fse.pathExists( cssPath ) ) {
    const buffer = await fse.readFile( cssPath, 'utf8' )
    return buffer.toString()
  }

  return ''
}

async function generateRoutes( pages ) {
  return 'const routes = [\n' + pages
    .map( page => `{
      name: '${ page.name }',
      path: '${ page.route }',
      page: ${ JSON.stringify( page.page ) },
      filepath: ${ JSON.stringify( tildify( page.filepath ) ) },
      component: () => import( /* webpackChunkName: ${ JSON.stringify( page.name ) } */ '${ pathUtils.toRelative( page.filepath ) }' ),
      provider: '${ page.provider }',
      plugin: '${ page.plugin }',
    }` ).join( ',\n' ) + '\n];' +
    `export default routes;`
}

module.exports = generateVirtualModules
