/* eslint-disable indent */

const path = require( 'path' )
const dirs = require( '../utils/dirs' )
const { getBabelOptions, createConfig } = require( '@nut-project/webpack' )

let pkg = {}
try {
  pkg = require( dirs.project + '/package.json' )
} catch ( e ) {}

module.exports = function createBaseConfig( nutConfig = {}, env ) {
  const browserslist = pkg.browserslist ||
    [ '>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9' ]

  const transpileModules = (
    nutConfig.babel && nutConfig.babel.transpileModules
  ) || []
  const internalTranspileModules = [
    'unfancy-router/src',
    `${ pkg.name }/lib/runtime/files`,
    /@nut-plugins/i,
    'debug', // from docsearch.js -> algoliasearch -> debug
  ]

  if ( nutConfig.plugins ) {
    const plugins = nutConfig.plugins
    Object.keys( plugins ).forEach( name => {
      if ( plugins[ name ].package ) {
        internalTranspileModules.push( plugins[ name ].package )
      }
    } )
  }

  const allTranspileModules = []
    .concat( transpileModules )
    .concat( internalTranspileModules )

  const exclude = [
    /src\/nut-auto-generated-pages\.js/,
    /src\/nut-auto-generated-routes\.js/,
    /src\/nut-auto-generated-route-components\//,
  ]

  const jsIncludeCaches = {}

  // from egoist/poi
  function include( filepath ) {
    filepath = filepath.replace( /\\/g, '/' )

    // use cache
    if ( typeof jsIncludeCaches[ filepath ] === 'boolean' ) {
      return jsIncludeCaches[ filepath ]
    }

    if ( !filepath.includes( 'node_modules' ) ) {
      jsIncludeCaches[ filepath ] = true
      return true
    }

    if ( allTranspileModules ) {
      const shouldTranspile = allTranspileModules.some( m => {
        if ( typeof m === 'string' ) {
          return filepath.includes( `/node_modules/${ m }/` ) ||
            filepath.includes( `/node_modules/_${ m.replace( /\//g, '_' ) }` )
        }

        if ( m && m.test ) {
          return m.test( filepath )
        }

        return false
      } )

      jsIncludeCaches[ filepath ] = shouldTranspile
      return shouldTranspile
    }

    jsIncludeCaches[ filepath ] = false
    return false
  }

  const config = createConfig( env, {
    browserslist,
    include,
    exclude,
    clean: nutConfig.output && nutConfig.output.clean === true,
    publicPath: nutConfig.output && nutConfig.output.publicPath,
    transpileModules: allTranspileModules,
  } )

  config
    .optimization
      .splitChunks( {
        cacheGroups: {
          vendors: {
            test( mod, chunks ) {
              if ( !mod.context || !mod.context.includes( 'node_modules' ) ) {
                 return false
               }

              if ( chunks.find( chunk => chunk.name === 'child' ) ) {
                return false
              }

              return true
            },
            name: 'vendors',
            chunks: 'initial',
            minChunks: 2,
          }
        },
      } )
      .end()
    .resolve
      .alias
        .set( '@', path.join( dirs.project, 'src' ) )
        .end()
      .modules
        .add( path.join( dirs.driver, '../../' ) )
        .add( path.join( dirs.driver, 'node_modules' ) )
        .end()
      .end()
    .resolveLoader
      .modules
        .add( path.join( dirs.driver, '../../' ) )
        .add( path.join( dirs.driver, 'node_modules' ) )
        .end()

  const babelOptions = getBabelOptions()
  babelOptions.presets.push( require.resolve( '@vue/babel-preset-jsx' ) )

  config.module
    .rule( 'markdown' )
      .test( /\.md$/ )
      .oneOf( 'vue' )
        .test( /\.vue\.md$/ )
        .use( 'mount-vue' )
          .loader( require.resolve( '../loader/mount-vue' ) )
          .end()
        .use( 'babel' )
          .loader( 'babel-loader' )
          .options( babelOptions )
          .end()
        .use( 'mdx-vue' )
          .loader( require.resolve( './mdx/vue-loader' ) )
          .options( {
            remarkPlugins: [
              ...( ( nutConfig.markdown && nutConfig.markdown.remarkPlugins ) || [] )
            ].filter( Boolean ),
            rehypePlugins: [
              require( '@mapbox/rehype-prism' ),
              require( 'rehype-slug' ),
              ...( ( nutConfig.markdown && nutConfig.markdown.rehypePlugins ) || [] )
            ].filter( Boolean ),
            compilers: [
              require( './mdx/vue-jsx-compiler' ),
            ]
          } )
          .end()
        .use( 'mdx-layout' )
          .loader( require.resolve( '../loader/mdx-arrtibutes' ) )
          .end()
        .end()
      .oneOf( 'normal' )
        .after( 'vue' )
          .use( 'mount-markdown' )
            .loader( require.resolve( '../loader/mount-markdown' ) )
            .end()

  config.module
    .rule( 'jsx' )
      .use( 'mount-react' )
        .loader( require.resolve( '../loader/mount-react' ) )
        .before( 'babel' )

  config.module
    .rule( 'vue' )
      .use( 'mount-vue' )
        .loader( require.resolve( '../loader/mount-vue' ) )
        .before( 'vue' )

  return config
}
