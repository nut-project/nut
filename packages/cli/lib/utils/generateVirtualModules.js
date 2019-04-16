const path = require( 'path' )
const fse = require( 'fs-extra' )
const tildify = require( 'tildify' )
const globby = require( 'globby' )

const dirs = require( './dirs' )
const getPages = require( './getPages' )

async function generateVirtualModules( config, { env = 'development' } = {} ) {
  const pages = await getPages( config )
  const normalized = await normalizeConfig( config, pages )
  const routes = await generateRoutes( pages )
  const plugins = await generatePlugins( normalized, { env } )
  const pluginOptions = await generatePluginOptions( normalized, { env } )
  const markdownThemeCSS = await generateMarkdownThemeCSS( config )
  const extendContext = await generateExtendContext( config, { env } )
  const appContent = await generateAppContent()

  return diff( {
    'node_modules/nut-auto-generated-pages.js': `export default ${ JSON.stringify( pages ) }`,
    'node_modules/nut-auto-generated-routes.js': routes,
    'node_modules/nut-auto-generated-plugins.js': plugins,
    'node_modules/nut-auto-generated-plugin-options.js': pluginOptions,
    'node_modules/nut-auto-generated-extend-context.js': extendContext,
    'node_modules/nut-auto-generated-nut-config.js': `export default ${ JSON.stringify( normalized ) }`,
    'node_modules/nut-auto-generated-markdown-theme.css': markdownThemeCSS,
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

  const map = {
    'development': 'dev',
    'production': 'prod',
  }

  const file = 'config/plugin.' + map[ env ] + '.js'

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
  // filter enable
  plugins = plugins.filter( plugin => plugin.enable )
  // filter env
  plugins = plugins.filter( plugin => ~plugin.env.indexOf( env ) )

  const _imports = plugins.map( ( plugin, index ) => {
    return `import plugin_${ index } from '${ plugin.path || plugin.package }';`
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
  plugin.env = plugin.env || [ 'development', 'production' ]
  plugin.enable = typeof plugin.enable !== 'undefined' ?
    !!plugin.enable :
    true

  return plugin
}

async function generateMarkdownThemeCSS( config ) {
  const lookupStartPath = path.join( dirs.cli, 'node_modules' )
  const theme = ( config.markdown && config.markdown.theme ) || 'prism-okaidia'
  const root = path.dirname( require.resolve( 'prismjs/package.json' ) )
  const request = 'themes/' + theme + '.css'
  const cssPath = path.join( root, request )

  if ( await fse.pathExists( cssPath ) ) {
    const buffer = await fse.readFile( cssPath, 'utf8' )
    return buffer.toString()
  }

  return ''
}

async function normalizeConfig( config, allPages ) {
  const sidebar = config.sidebar.map( s => {
    s.children = s.children || []
    const children = s.children
      .map( child => {
        const normalized = child.replace( /^(\/)/g, '' )
        return allPages.find( child => child.page === normalized )
      } )
      .filter( Boolean )

    return Object.assign( {}, s, { children } )
  } )

  return Object.assign( {}, config, { sidebar } )
}

async function generateRoutes( pages ) {
  let output = ''

  output = output + pages
    .map( page => `import ${ page.name } from '${ page.filepath }';` )
    .join( '\n' )

  output = output + 'const routes = [\n' + pages
    .map( page => `{
      name: '${ page.name }',
      layout: ${ page.attributes.layout ? "'" + page.attributes.layout + "'" : null },
      path: '${ page.route }',
      filepath: '${ tildify( page.filepath ) }',
      component: ${ page.name },
      provider: '${ page.provider }',
      plugin: '${ page.plugin }',
    }` ).join( ',\n' ) + '\n];' +
    `export default routes;`

  return output
}

module.exports = generateVirtualModules
