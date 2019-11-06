/* eslint-disable indent */

const path = require( 'path' )
const resolveFrom = require( 'resolve-from' )
const dirs = require( '../utils/dirs' )
const getBabelOptions = require( './get-babel-options' )

module.exports = function extend( config, nutConfig = {} ) {
  let vuePkgPath = resolveFrom.silent( process.cwd(), 'vue/package.json' )
  if ( !vuePkgPath ) {
    vuePkgPath = resolveFrom.silent( __dirname, 'vue/package.json' )
  }

  const vuePath = path.dirname( vuePkgPath )

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
        .set( 'vue$', vuePath )
        .end()
      .modules
        .add( path.join( dirs.root, '../../' ) )
        .add( path.join( dirs.root, 'node_modules' ) )
        .end()
      .end()
    .resolveLoader
      .modules
        .add( path.join( dirs.root, '../../' ) )
        .add( path.join( dirs.root, 'node_modules' ) )
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
