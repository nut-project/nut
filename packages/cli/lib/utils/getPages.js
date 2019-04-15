const path = require( 'path' )
const globby = require( 'globby' )
const fm = require( 'front-matter' )
const fse = require( 'fs-extra' )
const slugify = require( '@sindresorhus/slugify' )

const dirs = require( './dirs' )

module.exports = async function getAllPages( config ) {
  const root = path.join( dirs.project, 'src' )
  const pages = await getPages( root )
  const pluginPages = await getPluginPages( config.plugins )

  pages.push( ...pluginPages )

  return pages
    .filter( page => removeComponents )
}

function removeComponents( page ) {
  return !~page.filepath.indexOf( 'components' )
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
    'pages/**/*.vue',
  ], {
    cwd: root,
    deep: true,
    onlyFiles: true,
  } )

  const types = {
    '.js': 'js',
    '.md': 'markdown',
    '.vue': 'vue',
  }

  function postfix( text, index ) {
    return text + index
  }

  const promises = files
    .sort( ( a, b ) => {
      if ( a < b ) {
        return 1
      }

      if ( a > b ) {
        return -1
      }

      return 0
    } )
    .map( async ( file, index ) => {
      const { dir, ext, name } = path.parse( file )
      const filepath = path.join( root, file )
      const page = path.join( dir, name )

      return processor( {
        name: postfix(
          slugify( page, { separator: '$' } ),
          index
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

async function readAttributes( filepath ) {
  const buffer = await fse.readFile( filepath, 'utf8' )
  const content = buffer.toString()
  const result = fm( content )
  return result.attributes || {}
}
