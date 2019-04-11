const path = require( 'path' )
const fse = require( 'fs-extra' )
const tildify = require( 'tildify' )
const globby = require( 'globby' )
const {
  NodeJsInputFileSystem,
  CachedInputFileSystem,
  ResolverFactory
} = require( 'enhanced-resolve' )
const fm = require( 'front-matter' )
const slugify = require( '@sindresorhus/slugify' )

const dirs = {
  cli: path.join( __dirname, '../../' ),
  project: process.cwd(),
}

async function generateVirtualModules( config, { env = 'development' } = {} ) {
  const root = path.join( dirs.project, 'src' )
  const pages = await getPages( root )
  const pluginPages = await getPluginPages( config.plugins )

  pages.push( ...pluginPages )

  const normalized = await normalizeConfig( config, pages )
  const routes = await generateRoutes( pages, config.layout )
  const plugins = await generatePlugins( normalized, { env } )
  const pluginOptions = await generatePluginOptions( normalized, { env } )
  const markdownThemeCSS = await generateMarkdownThemeCSS( config )
  const extendContext = await generateExtendContext( config, { env } )

  return {
    'node_modules/nut-auto-generated-pages.js': `export default ${ JSON.stringify( pages ) }`,
    'node_modules/nut-auto-generated-routes.js': routes,
    'node_modules/nut-auto-generated-plugins.js': plugins,
    'node_modules/nut-auto-generated-plugin-options.js': pluginOptions,
    'node_modules/nut-auto-generated-extend-context.js': extendContext,
    'node_modules/nut-auto-generated-nut-config.js': `export default ${ JSON.stringify( normalized ) }`,
    'node_modules/nut-auto-generated-markdown-theme.css': markdownThemeCSS,
  }
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

const resolver = ResolverFactory.createResolver( {
  extensions: [ '.js', '.md' ],
  fileSystem: new CachedInputFileSystem( new NodeJsInputFileSystem(), 4000 )
} )

async function generateMarkdownThemeCSS( config ) {
  const lookupStartPath = path.join( dirs.cli, 'node_modules' )
  const request = 'prismjs/themes/' + config.markdown.theme + '.css'

  return await new Promise( ( resolve, reject ) => {
    resolver.resolve( {}, lookupStartPath, './' + request, {}, async ( err, filepath ) => {
      if ( err ) {
        return reject( err )
      }

      const buffer = await fse.readFile( filepath )
      resolve( buffer.toString() )
    } )
  } )
}

function resolve( request ) {
  const lookupStartPath = path.join( dirs.project, 'src' )
  return new Promise( ( resolve, reject ) => {
    resolver.resolve( {}, lookupStartPath, './' + request, {}, ( err, filepath ) => {
      if ( err ) {
        return reject( err )
      }
      resolve( filepath )
    } )
  } )
}

async function normalizeConfig( config, allPages ) {
  const sidebar = config.sidebar.map( s => {
    const pages = s.pages
      .map( page => {
        const normalized = page.replace( /^(\/)/g, '' )
        return allPages.find( page => page.page === normalized )
      } )
      .filter( Boolean )

    return Object.assign( {}, s, { pages } )
  } )

  return Object.assign( {}, config, { sidebar } )
}

const texts = new Set()
let index = 0

function ensureUnique( text ) {
  if ( !texts.has( text ) ) {
    texts.add( text )
    return text
  }

  index++
  return text + index
}

async function readAttributes( filepath ) {
  const buffer = await fse.readFile( filepath )
  const content = buffer.toString()
  const result = fm( content )
  return result.attributes || {}
}

async function getPluginPages( plugins = {} ) {
  const pages = []

  const promises = Object.keys( plugins ).map( async name => {
    const plugin = plugins[ name ]
    const root = path.dirname( plugin.path )

    const pluginPages = await getPages( root, page => {
      page.name = page.name + '_' + slugify( name, { separator: '$' } )
      page.page = page.page + '@' + name
      page.route = page.route + '@' + name
      page.provider = 'plugin'
      page.plugin = name
      return page
    } )

    pages.push( ...pluginPages )
  } )

  await Promise.all( promises )

  return pages.filter( Boolean )
}

async function getPages( root, processor = v => v ) {
  const files = await globby( [
    'pages/**/*.js',
    'pages/**/*.md',
  ], {
    cwd: root,
    deep: true,
    onlyFiles: true,
  } )

  const types = {
    '.js': 'js',
    '.md': 'markdown',
  }

  const promises = files.map( async file => {
    const { dir, ext, name } = path.parse( file )
    const filepath = path.join( root, file )
    const page = path.join( dir, name )

    return processor( {
      name: ensureUnique(
        slugify( page, { separator: '$' } )
      ),
      filepath,
      page,
      route: '/' + page.replace( /(\/_)(.+)/g, '/:$2' ),
      attributes: await readAttributes( filepath ),
      type: types[ ext ] || '',
      provider: '',
      plugin: '',
    } )
  } )

  return await Promise.all( promises )
}

async function generateRoutes( pages, globalLayout ) {
  let output = ''

  output = output + pages
    .map( page => `import ${ page.name } from '${ page.filepath }';` )
    .join( '\n' )

  output = output + 'const routes = [\n' + pages
    .map( page => `{
      name: '${ page.name }',
      layout: '${ page.attributes.layout || globalLayout || 'default' }',
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
