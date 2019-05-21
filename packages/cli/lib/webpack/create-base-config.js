const path = require( 'path' )
const HtmlWebpackPlugin = require( 'html-webpack-plugin' )
const CopyPlugin = require( 'copy-webpack-plugin' )
const FriendlyErrorsWebpackPlugin = require( 'friendly-errors-webpack-plugin' )
const VueLoaderPlugin = require( 'vue-loader/lib/plugin' )
const WebpackBar = require( 'webpackbar' )
const Config = require( 'webpack-chain' )

const threadLoader = require('thread-loader');

threadLoader.warmup( {}, [
  'babel-loader',
] )

const dirs = {
  cli: path.join( __dirname, '../../' ),
  project: process.cwd(),
}

module.exports = function createBaseConfig( nutConfig = {} ) {
  const config = new Config()

  config
    .entry( 'index' )
      .add( path.join( dirs.cli, 'lib/runtime/entry.js' ) )
      .end()
    .optimization
      .splitChunks( {
        chunks: 'all',
        minChunks: 2,
      } )
      .runtimeChunk( {
        name: 'runtime',
      } )
      .end()
    .performance
      .hints( false )
      .end()
    .resolve
      .alias
        .set( '@', path.join( dirs.project, 'src' ) )
        .end()
      .modules
        .clear()
        .add( path.join( dirs.project, 'node_modules' ) )
        .add( path.join( dirs.cli, '../../' ) )
        .add( path.join( dirs.cli, 'node_modules' ) )
        .add( 'node_modules' )
        .end()
      .extensions
        .merge( [
          '.js', '.json',
          '.vue',
          '.md', '.vue.md',
          '.scss', '.sass', '.less', '.styl', '.stylus', '.css'
        ] )
        .end()
      .end()
    .resolveLoader
      .modules
      .clear()
      .add( path.join( dirs.project, 'node_modules' ) )
      .add( path.join( dirs.cli, '../../' ) )
      .add( path.join( dirs.cli, 'node_modules' ) )
      .add( 'node_modules' )
      .end()

  config
    .plugin( 'copy' )
      .use( CopyPlugin, [
        [
          {
            from: {
              glob: '**/*',
              dot: true
            },
            to: '.',
            ignore: [ '.DS_Store' ]
          }
        ],
        {
          context: path.join( dirs.project, 'src/public' )
        }
      ] )
      .end()
    .plugin( 'html' )
      .use( HtmlWebpackPlugin, [
        {
          template: path.join( __dirname, './template.html' ),
          title: ( nutConfig.html && nutConfig.html.title ) || nutConfig.zh || nutConfig.en,
          favicon: ( nutConfig.html && nutConfig.html.favicon ) || path.join( __dirname, '../runtime/favicon.png' ),
        }
      ] )
      .end()
    .plugin( 'vue-loader' )
      .use( VueLoaderPlugin )
      .end()
    .plugin( 'webpackbar' )
      .use( WebpackBar )
      .end()
    .plugin( 'friendly-error' )
      .use( FriendlyErrorsWebpackPlugin, [
        {
          clearConsole: false,
        }
      ] )
      .end()

  const markdownRule = config.module
    .rule( 'markdown' )
      .test( /\.md$/ )
      .oneOf( 'vue' )
        .test( /\.vue\.md$/ )
        .use( 'mount-vue' )
          .loader( require.resolve( '../loader/mount-vue' ) )
          .end()
        .use( 'babel' )
          .loader( 'babel-loader' )
          .options( {
            presets: [
              [
                require.resolve( '@babel/preset-env' ),
                {
                  targets: {
                    browsers: [ 'last 2 versions', 'safari >= 7' ]
                  }
                }
              ],
              require.resolve( '@vue/babel-preset-jsx' ),
            ],
            plugins: [
              [ require.resolve( '@babel/plugin-transform-runtime' ) ]
            ]
          } )
          .end()
        .use( 'mdx-vue' )
          .loader( '@mdx-js/vue-loader' )
          .end()
        .use( 'mdx-layout' )
          .loader( require.resolve( '../loader/provide-mdx-layout' ) )
          .end()
        .end()
      .oneOf( 'normal' )
        .after( 'vue' )
          .use( 'mount-markdown' )
            .loader( require.resolve( '../loader/mount-markdown' ) )
            .end()
          .use( 'markdown' )
            .loader( require.resolve( '../loader/markdown' ) )
            .options( {
              gfm: true,
            } )

  const transpileModules = ( nutConfig.babel && nutConfig.babel.transpileModules ) || []
  const internalTranspileModules = [
    'unfancy-router',
    require( '../../package.json' ).name,
  ]
  const allTranspileModules = []
    .concat( transpileModules )
    .concat( internalTranspileModules )

  const jsIncludeCaches = {}
  config.module
    .rule( 'js' )
    .test( /\.js$/ )
    .include
      // from egoist/poi
      .add( filepath => {
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
              return filepath.includes( `/node_modules/${ m }/` )
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
      } )
      .end()
    .oneOf( 'normal' )
      .resource( /nut-auto-generated/ )
      .use( 'babel' )
        .loader( 'babel-loader' )
        .options( {
          presets: [
            [
              require.resolve( '@babel/preset-env' ),
              {
                targets: {
                  browsers: [ 'last 2 versions', 'safari >= 7' ]
                }
              }
            ]
          ],
          plugins: [
            require.resolve( '@babel/plugin-transform-runtime' ),
            require.resolve( '@babel/plugin-syntax-dynamic-import' ),
          ]
        } )
        .end()
      .end()
    .oneOf( 'with-thread' )
      .use( 'thread' )
        .loader( 'thread-loader' )
        .end()
      .use( 'babel' )
        .loader( 'babel-loader' )
        .options( {
          presets: [
            [
              require.resolve( '@babel/preset-env' ),
              {
                targets: {
                  browsers: [ 'last 2 versions', 'safari >= 7' ]
                }
              }
            ]
          ],
          plugins: [
            require.resolve( '@babel/plugin-transform-runtime' ),
            require.resolve( '@babel/plugin-syntax-dynamic-import' ),
          ]
        } )

  config.module
    .rule( 'image' )
      .test( /\.(png|jpg|gif)$/i )
      .use( 'url' )
        .loader( 'url-loader' )
        .options( {
          limit: 8192
        } )

  config.module
    .rule( 'font' )
      .test( /\.(ttf|eot|woff|woff2|svg)(\?t=\d+)?$/i )
      .use( 'url' )
        .loader( 'url-loader' )
        .options( {
          limit: 8192
        } )

  const vueCacheOptions = {
    cacheDirectory: path.join( process.cwd(), 'node_modules/.cache/vue-loader' ),
    cacheIdentifier: require( '../utils/getVueCacheIdentifier' )()
  }

  config.module
    .rule( 'vue' )
      .test( /\.vue$/ )
      .use( 'cache' )
        .loader( 'cache-loader' )
        .options( vueCacheOptions )
        .end()
      .use( 'mount-vue' )
        .loader( require.resolve( '../loader/mount-vue' ) )
        .end()
      .use( 'vue' )
        .loader( 'vue-loader' )

  return config
}
