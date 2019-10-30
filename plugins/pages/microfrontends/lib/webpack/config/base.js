const path = require( 'path' )
const FriendlyErrorsWebpackPlugin = require( 'friendly-errors-webpack-plugin' )
const { CleanWebpackPlugin } = require( 'clean-webpack-plugin' )
const VueLoaderPlugin = require( 'vue-loader/lib/plugin' )
const WebpackBar = require( 'webpackbar' )
const { webpack } = require( '@nut-project/webpack' )
const threadLoader = require( 'thread-loader' )
const resolveFrom = require( 'resolve-from' )

/*
  options:

  {
    env = 'development',
    clean = true,
    browserslist: [],
    transpileModules: [],
    include,
    exclude,
  }
 */
module.exports = function ( config, options ) {
  threadLoader.warmup( {}, [
    'babel-loader',
  ] )

  options.browserslist = options.browserslist ||
    [ '>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9' ]

  const root = path.join( __dirname, '../../../' )

  config.resolve.modules
    .clear()
    .add( 'node_modules' ) // use closest node_modules first
    .add( path.join( process.cwd(), 'node_modules' ) )
    .add( path.join( root, '../../' ) )
    .add( path.join( root, 'node_modules' ) )

  config.resolveLoader.modules
    .clear()
    .add( 'node_modules' )
    .add( path.join( process.cwd(), 'node_modules' ) )
    .add( path.join( root, '../../' ) )
    .add( path.join( root, 'node_modules' ) )

  config.output.publicPath( options.publicPath || '/' )

  js( config, options )
  jsx( config, options )
  ts( config, options )
  perfHints( config )
  extensions( config )
  progress( config )
  vue( config )
  pug( config )
  image( config )
  fonts( config )
  error( config )
  define( config )

  if ( options.clean ) {
    clean( config )
  }

  return config
}

function define( config ) {
  config.plugin( 'define' )
    .use( webpack.DefinePlugin, [ {} ] )
}

function getBabelOptions( { browserslist } = {} ) {
  return {
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
  }
}

function ts( config, { include } = {} ) {
  // TODO: support .tsx

  const tsLoaderOptions = {
    transpileOnly: true,
    appendTsSuffixTo: [ /\.vue$/ ],
  }

  let configFile = resolveFrom.silent( process.cwd(), './tsconfig.json' )

  if ( !configFile ) {
    configFile = path.join( __dirname, 'tsconfig.json' )
    tsLoaderOptions.context = process.cwd()
    tsLoaderOptions.configFile = configFile
  }

  config.module
    .rule( 'ts' )
    .test( /\.ts$/i )
    .include
    .add( include )
    .end()
    .use( 'ts' )
    .loader( require.resolve( 'ts-loader' ) )
    .options( tsLoaderOptions )
    .end()

  const tslintConfigFile = resolveFrom.silent( process.cwd(), './tslint.json' )

  config
    .plugin( 'fork-ts-checker' )
    .use( require( 'fork-ts-checker-webpack-plugin' ), [
      {
        vue: true,
        tsconfig: configFile,
        tslint: Boolean( tslintConfigFile ),
        formatter: 'codeframe',
        checkSyntacticErrors: false,
        measureCompilationTime: false,
      }
    ] )
}

function jsx( config, { browserslist, include } = {} ) {
  const babelOptions = getBabelOptions( { browserslist } )

  babelOptions.presets.push( [
    require.resolve( '@babel/preset-react' ),
    {
      development: process.env.NODE_ENV === 'development',
    }
  ] )

  config.module
    .rule( 'jsx' )
    .test( /\.jsx$/i )
    .include
    .add( include )
    .end()
    .use( 'babel' )
    .loader( 'babel-loader' )
    .options( babelOptions )
    .end()
}

function js( config, { browserslist, include, exclude } = {} ) {
  const babelOptions = getBabelOptions( { browserslist } )

  config.module
    .rule( 'js' )
    .test( /\.js$/ )
    .include
    .add( include )
    .end()
    .exclude
    .add( exclude )
    .end()
    .oneOf( 'virtual' )
    // cannot apply thread-loader to virtual modules
    .resource( /\/\.nut\// )
    .use( 'babel' )
    .loader( 'babel-loader' )
    .options( babelOptions )
    .end()
    .end()
    .oneOf( 'with-thread' )
    .use( 'thread' )
    .loader( require.resolve( 'thread-loader' ) )
    .end()
    .use( 'babel' )
    .loader( require.resolve( 'babel-loader' ) )
    .options( babelOptions )
}

function perfHints( config ) {
  config.performance.hints( false )
}

function extensions( config ) {
  config.resolve.extensions.merge( [
    '.js', '.json',
    '.vue', '.jsx',
    '.ts', '.tsx',
    '.md', '.vue.md',
    '.scss', '.sass', '.less', '.styl', '.stylus', '.css'
  ] )
}

function image( config ) {
  config.module
    .rule( 'image' )
    .test( /\.(png|jpg|gif)$/i )
    .use( 'url' )
    .loader( require.resolve( 'url-loader' ) )
    .options( {
      fallback: require.resolve( 'file-loader' ),
      limit: 8192
    } )
}

function error( config ) {
  config
    .plugin( 'friendly-error' )
    .use( FriendlyErrorsWebpackPlugin, [
      {
        clearConsole: false,
      }
    ] )
    .end()
}

function pug( config ) {
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
}

function progress( config ) {
  config
    .plugin( 'webpackbar' )
    .use( WebpackBar )
    .end()
}

function clean( config ) {
  config.plugin( 'clean' )
    .use( CleanWebpackPlugin )
}

function vue( config ) {
  const vueCacheOptions = {
    cacheDirectory: path.join(
      process.cwd(),
      'node_modules/.cache/vue-loader'
    ),
    cacheIdentifier: getVueCacheIdentifier()
  }

  config.module
    .rule( 'vue' )
    .test( /\.vue$/ )
    .use( 'cache' )
    .loader( require.resolve( 'cache-loader' ) )
    .options( vueCacheOptions )
    .end()
    .use( 'vue' )
    .loader( require.resolve( 'vue-loader' ) )

  config
    .plugin( 'vue-loader' )
    .use( VueLoaderPlugin )
    .end()
}

function fonts( config ) {
  config.module
    .rule( 'font' )
    .test( /\.(ttf|eot|woff|woff2|svg)(\?t=\d+)?$/i )
    .use( 'url' )
    .loader( require.resolve( 'url-loader' ) )
    .options( {
      fallback: require.resolve( 'file-loader' ),
      limit: 8192
    } )
}

function getVueCacheIdentifier() {
  const vueLoaderPath = path.dirname( require.resolve( 'vue-loader' ) )
  const compilerPath = resolveFrom(
    vueLoaderPath,
    '@vue/component-compiler-utils/package'
  )

  const vueTemplateCompilerPath = resolveFrom.silent( process.cwd(), 'vue-template-compiler/package' )

  return JSON.stringify( {
    '@vue/component-compiler-utils': require( compilerPath ).version,
    'vue-loader': require( 'vue-loader/package' ).version,
    'vue-template-compiler': vueTemplateCompilerPath ?
      require( vueTemplateCompilerPath ).version :
      require( 'vue-template-compiler/package' ).version
  } )
}
