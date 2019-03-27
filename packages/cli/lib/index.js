const fse = require( 'fs-extra' )
const cosmiconfig = require( 'cosmiconfig' )
const WebpackDevServer = require( 'webpack-dev-server' )
const webpack = require( 'webpack' )
const path = require( 'path' )
const VirtualModulesPlugin = require( 'webpack-virtual-modules' )
const chokidar = require( 'chokidar' )
const {
  NodeJsInputFileSystem,
  CachedInputFileSystem,
  ResolverFactory
} = require( 'enhanced-resolve' )
const slugify = require( '@sindresorhus/slugify' )
const fm = require( 'front-matter' )
const webpackConfig = require( './webpack.config' )

process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
  });

const dirs = {
  cli: path.join( __dirname, '../' ),
  project: process.cwd(),
}

const explorer = cosmiconfig( 'nut', {
  cache: false,
} )

;( async () => {
  let result = {}
  let config = {}
  try {
    result = await explorer.search()
    config = result.config
  } catch ( e ) {
    console.log( e )
  }

  const modules = await generateVirtualModules( config )

  const virtualModules = new VirtualModulesPlugin( modules )

  webpackConfig.plugins.push( virtualModules )

  const options = {
    contentBase: './dist',
    hot: true,
    host: '127.0.0.1',
  }

  WebpackDevServer.addDevServerEntrypoints( webpackConfig, options )
  const compiler = webpack( webpackConfig )
  const server = new WebpackDevServer( compiler, options )

  server.listen( 8080, '127.0.0.1', () => {
    console.log( 'Starting server on http://127.0.0.1:8080' )
  } )

  chokidar.watch( [ result.filepath ] )
    .on( 'change', async () => {
      try {
        result = await explorer.search()
        config = result.config

        const modules = await generateVirtualModules( config )

        for ( let [ path, content ] of Object.entries( modules ) ) {
          virtualModules.writeModule(
            path,
            content
          )
        }
      } catch (e) {
        console.log( e )
      }
    } )
} )()

async function generateVirtualModules( config ) {
  const normalized = await normalizeConfig( config )
  const routes = await generateRoutes( normalized )

  return {
    'node_modules/nut-auto-generated-routes.js': routes,
    'node_modules/nut-auto-generated-nut-config.js': `export default ${ JSON.stringify( normalized ) }`,
  }
}

const resolver = ResolverFactory.createResolver( {
  extensions: [ '.js', '.md' ],
  fileSystem: new CachedInputFileSystem(new NodeJsInputFileSystem(), 4000)
} )

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

async function normalizeConfig( config ) {
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

  const promises = config.sidebar.map( async s => {
    const promises = s.pages.map( async page => {
      let hidden = false
      if ( page.startsWith( '!' ) ) {
        hidden = true
      }

      const trimed = page.replace( /^(!|\/|^)/g, '' )
      const route = '/defaultの' + trimed.replace( /(\/_)(.+)/g, '/:$2' )

      const filepath = await resolve( trimed )

      const buffer = await fse.readFile( filepath )
      const content = buffer.toString()

      const result = fm( content )

      return {
        name: ensureUnique(
          slugify( trimed, { separator: '$' } )
        ),
        path: trimed,
        route,
        hidden,
        attributes: result.attributes || {},
      }
    } )


    return Object.assign( {}, s, {
      pages: await Promise.all( promises ),
    } )
  } )

  return Object.assign( {}, config, {
    sidebar: await Promise.all( promises )
  } )
}

async function generateRoutes( config = {} ) {
  const sidebar = config.sidebar || []

  const imports = []

  sidebar.map( s => {
    s.pages.map( ( { name, path, route, hidden } = {} ) => {
      imports.push( { name, path, route, hidden } )
    } )
  } )

  let output = ''

  output = output + imports
    .map( imp => `import ${ imp.name } from '@/${ imp.path }';` )
    .join( '\n' )

  output = output + 'const routes = [\n' + imports
    .map( imp => `{
      name: '${ imp.name }',
      path: '${ imp.route }',
      component: ${ imp.name },
    }` ).join( ',\n' ) + '\n];' +
    `export default routes;`

  return output
}
