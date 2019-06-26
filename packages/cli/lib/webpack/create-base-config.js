/* eslint-disable indent */

const path = require( 'path' )
const fse = require( 'fs-extra' )
const HtmlWebpackPlugin = require( 'html-webpack-plugin' )
const CopyPlugin = require( 'copy-webpack-plugin' )
const FriendlyErrorsWebpackPlugin = require( 'friendly-errors-webpack-plugin' )
const StatsWriterPlugin = require( 'webpack-stats-plugin' ).StatsWriterPlugin
const CleanWebpackPlugin = require( 'clean-webpack-plugin' ).default
const VueLoaderPlugin = require( 'vue-loader/lib/plugin' )
const WebpackBar = require( 'webpackbar' )
const PnpWebpackPlugin = require( 'pnp-webpack-plugin' )
const Config = require( 'webpack-chain' )
const threadLoader = require( 'thread-loader' )

const dirs = {
  cli: path.join( __dirname, '../../' ),
  project: process.cwd(),
}

let pkg = {}
try {
  pkg = require( dirs.project + '/package.json' )
} catch ( e ) {}

const browserslist = pkg.browserslist ||
  [ '>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9' ]

module.exports = function createBaseConfig( nutConfig = {}, appId ) {
  threadLoader.warmup( {}, [
    'babel-loader',
  ] )

  const config = new Config()

  let entry

  switch ( nutConfig.type ) {
  case 'host':
    entry = path.join( dirs.cli, 'lib/runtime/entries/host.js' )
    break
  case 'child':
    entry = path.join( dirs.cli, 'lib/runtime/entries/child.js' )
    config.output.jsonpFunction( 'webpackJsonp_' + appId )
    config.plugin( 'stats-write' )
      .use( StatsWriterPlugin, [
        {
          filename: 'manifest.json',
          transform( data ) {
            const files = []

            const index = data.assetsByChunkName.index
            if ( Array.isArray( index ) ) {
              const jsfiles = index.filter( file => file.endsWith( '.js' ) )
              files.push( ...jsfiles )
            } else if ( typeof index === 'string' ) {
              if ( index.endsWith( '.js' ) ) {
                files.push( index )
              }
            }
            return JSON.stringify( {
              files,
            }, 0, 2 )
          }
        }
      ] )
    // use jsonp to fix cors issue
    config.plugin( 'stats-write-js' )
      .use( StatsWriterPlugin, [
        {
          filename: 'manifest.js',
          transform( data ) {
            const files = []

            const index = data.assetsByChunkName.index
            if ( Array.isArray( index ) ) {
              const jsfiles = index.filter( file => file.endsWith( '.js' ) )
              files.push( ...jsfiles )
            } else if ( typeof index === 'string' ) {
              if ( index.endsWith( '.js' ) ) {
                files.push( index )
              }
            }

            const json = JSON.stringify( {
              files,
              id: appId,
            }, 0, 2 )

            return `
( function () {
  if ( window.nutManifestJSONP ) {
    var currentScript = document.currentScript
    var dataset = currentScript ? currentScript.dataset : {}
    window.nutManifestJSONP( ${ json }, dataset )
  }
} )()
`.trim()
          }
        }
      ] )
    break
  default:
    entry = path.join( dirs.cli, 'lib/runtime/entries/single.js' )
  }

  if ( nutConfig.type === 'single' ) {
    config.optimization
      .runtimeChunk( {
        name: 'runtime',
      } )
  }

  config
    .entry( 'index' )
      .add( entry )
      .end()
    .optimization
      .splitChunks( {
        chunks: 'all',
        minChunks: 2,
      } )
      .end()
    .performance
      .hints( false )
      .end()
    .resolve
      .alias
        .set( '@', path.join( dirs.project, 'src' ) )
        // pnp start
        .set( '@babel/runtime', path.dirname( require.resolve( '@babel/runtime/package' ) ) )
        .set( 'core-js', path.dirname( require.resolve( 'core-js/package' ) ) )
        .set( 'regenerator-runtime', path.dirname( require.resolve( 'regenerator-runtime/package' ) ) )
        // pnp end
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
          '.vue', '.jsx',
          '.ts', '.tsx',
          '.md', '.vue.md',
          '.scss', '.sass', '.less', '.styl', '.stylus', '.css'
        ] )
        .end()
      .plugin( 'pnp' )
        .use( PnpWebpackPlugin )
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
      .plugin( 'pnp' )
        .use( PnpWebpackPlugin.moduleLoader( module ) )
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
          ...( nutConfig.html || {} ),
          template: ( nutConfig.html && nutConfig.html.template ) || path.join( __dirname, './template.ejs' ),
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
          .options( {
            presets: [
              [
                require.resolve( '@babel/preset-env' ),
                {
                  targets: {
                    browsers: browserslist
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
          .loader( require.resolve( './mdx/vue-loader' ) )
          .options( {
            rehypePlugins: [
              require( '@mapbox/rehype-prism' ),
            ],
            compilers: [
              require( './mdx/vue-jsx-compiler' ),
            ]
          } )
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

  const transpileModules = (
    nutConfig.babel && nutConfig.babel.transpileModules
  ) || []
  const internalTranspileModules = [
    'unfancy-router',
    require( '../../package.json' ).name,
    /@nut-plugins/i,
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

  const jsIncludeCaches = {}

  // from egoist/poi
  function filterInclude( filepath ) {
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
  }

  config.module
    .rule( 'js' )
    .test( /\.js$/ )
    .include
      .add( filterInclude )
      .end()
    .oneOf( 'normal' )
      // cannot apply thread-loader to virtual modules
      .resource( /nut-auto-generated/ )
      .use( 'babel' )
        .loader( 'babel-loader' )
        .options( {
          presets: [
            [
              require.resolve( '@babel/preset-env' ),
              {
                targets: {
                  browsers: browserslist
                }
              }
            ]
          ],
          plugins: [
            require.resolve( '@babel/plugin-transform-runtime' ),
            require.resolve( '@babel/plugin-syntax-dynamic-import' ),
          ],
          sourceType: 'unambiguous',
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
                  browsers: browserslist
                }
              }
            ]
          ],
          plugins: [
            require.resolve( '@babel/plugin-transform-runtime' ),
            require.resolve( '@babel/plugin-syntax-dynamic-import' ),
          ],
          sourceType: 'unambiguous',
        } )

  config.module
    .rule( 'jsx' )
      .test( /\.jsx$/i )
      .include
        .add( filterInclude )
        .end()
      .use( 'mount-react' )
        .loader( require.resolve( '../loader/mount-react' ) )
        .end()
      .use( 'babel' )
        .loader( 'babel-loader' )
        .options( {
          presets: [
            [
              require.resolve( '@babel/preset-env' ),
              {
                targets: {
                  browsers: browserslist
                }
              }
            ],
            [
              require.resolve( '@babel/preset-react' ),
              {
                development: process.env.NODE_ENV === 'development',
              }
            ]
          ],
          plugins: [
            require.resolve( '@babel/plugin-transform-runtime' ),
            require.resolve( '@babel/plugin-syntax-dynamic-import' ),
          ]
        } )
        .end()

  // TODO: support .tsx later
  const tsLoaderOptions = {
    appendTsSuffixTo: [ /\.vue$/ ]
  }

  if (
    !fse.pathExistsSync( path.join( dirs.project, 'tsconfig.json' ) )
  ) {
    tsLoaderOptions.context = dirs.project
    tsLoaderOptions.configFile = path.join( __dirname, 'tsconfig.json' )
  }

  config.module
    .rule( 'ts' )
      .test( /\.ts$/i )
      .include
        .add( filterInclude )
        .end()
      .use( 'ts' )
        .loader( require.resolve( 'ts-loader' ) )
        .options( PnpWebpackPlugin.tsLoaderOptions( tsLoaderOptions ) )
        .end()

  config.module
    .rule( 'image' )
      .test( /\.(png|jpg|gif)$/i )
      .use( 'url' )
        .loader( require.resolve( 'url-loader' ) )
        .options( {
          limit: 8192
        } )

  config.module
    .rule( 'font' )
      .test( /\.(ttf|eot|woff|woff2|svg)(\?t=\d+)?$/i )
      .use( 'url' )
        .loader( require.resolve( 'url-loader' ) )
        .options( {
          limit: 8192
        } )

  const vueCacheOptions = {
    cacheDirectory: path.join(
      process.cwd(),
      'node_modules/.cache/vue-loader'
    ),
    cacheIdentifier: require( '../utils/get-vue-cache-identifier' )()
  }

  config.module
    .rule( 'vue' )
      .test( /\.vue$/ )
      .use( 'cache' )
        .loader( require.resolve( 'cache-loader' ) )
        .options( vueCacheOptions )
        .end()
      .use( 'mount-vue' )
        .loader( require.resolve( '../loader/mount-vue' ) )
        .end()
      .use( 'vue' )
        .loader( require.resolve( 'vue-loader' ) )

  config.module
    .rule( 'pug' )
      .test( /\.pug$/ )
      .oneOf( 'vue' )
        .resourceQuery( /^\?vue/ )
        .use( 'pug' )
          .loader( 'pug-plain-loader' )
          .end()
        .end()
      .oneOf( 'plain' )
        .use( 'raw' )
          .loader( 'raw-loader' )
          .end()
        .end()
        .use( 'pug' )
          .loader( 'pug-plain-loader' )
          .end()
        .end()

  if ( nutConfig.output && nutConfig.output.clean === true ) {
    config.plugin( 'clean' )
      .use( CleanWebpackPlugin )
  }

  if ( nutConfig.output && nutConfig.output.publicPath ) {
    config.output.publicPath( nutConfig.output.publicPath )
  } else {
    config.output.publicPath( '/' )
  }

  return config
}
