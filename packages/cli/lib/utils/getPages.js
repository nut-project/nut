const path = require( 'path' )
const globby = require( 'globby' )
const fm = require( 'front-matter' )
const fse = require( 'fs-extra' )
const slugify = require( '@sindresorhus/slugify' )

const dirs = require( './dirs' )
const pathUtils = require( './pathUtils' )

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
    let root

    if ( plugin.path ) {
      root = path.dirname( plugin.path )
    }

    if ( plugin.package ) {
      root = path.dirname( require.resolve( plugin.package + '/package.json' ) )
    }

    if ( !root ) {
      return Promise.resolve()
    }

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

  const extensionReg = /(\.js|(?:\.vue)?\.md|\.vue)$/

  const types = {
    '.js': 'js',
    '.md': 'markdown',
    '.vue.md': 'markdown',
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
      let { dir, ext, name } = path.parse( file )
      const matches = extensionReg.exec( name + ext )

      name = matches[ 0 ] ? ( name + ext ).replace( extensionReg, '' ) : name
      ext = matches[ 0 ] ? matches[ 0 ] : ext

      const filepath = path.join( root, file )
      const page = pathUtils.normalize( path.join( dir, name ) )

      return processor( {
        name: postfix(
          slugify( page, { separator: '$' } ),
          index
        ),
        filepath,
        page,
        route: '/' + page.replace( /(\/_)(.+)/g, '/:$2' ),
        type: types[ ext ] || '',
        provider: '',
        plugin: '',
      } )
    } )

  return await Promise.all( promises )
}
