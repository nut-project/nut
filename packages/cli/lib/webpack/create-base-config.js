const path = require( 'path' )
const HtmlWebpackPlugin = require( 'html-webpack-plugin' )
const CopyPlugin = require( 'copy-webpack-plugin' )
const VueLoaderPlugin = require( 'vue-loader/lib/plugin' )
const WebpackBar = require( 'webpackbar' )

const dirs = {
  cli: path.join( __dirname, '../../' ),
  project: process.cwd(),
}

module.exports = function createBaseConfig( config ) {
  const webpackConfig = {
    entry: path.join( dirs.cli, 'lib/runtime/entry.js' ),
    performance: {
      hints: false,
    },
    resolve: {
      alias: {
        '@': path.join( dirs.project, 'src' )
      },
      modules: [
        path.join( dirs.project, 'node_modules' ),
        path.join( dirs.cli, '../../' ),
        path.join( dirs.cli, 'node_modules' ),
        'node_modules',
      ],
      extensions: [ '.js', '.json', '.md', '.less', '.css' ]
    },
    resolveLoader: {
      modules: [
        path.join( dirs.project, 'node_modules' ),
        path.join( dirs.cli, '../../' ),
        path.join( dirs.cli, 'node_modules' ),
        'node_modules',
      ],
    },
    module: {
      rules: [
        {
          test: /\.module\.less$/,
          use: [ {
            loader: 'style-loader',
          }, {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: "[local]___[hash:base64:5]",
            },
          }, {
            loader: 'less-loader'
          } ]
        },
        {
          test: /\.less$/,
          exclude: /\.module\.less$/,
          use: [ {
            loader: 'style-loader',
          }, {
            loader: 'css-loader'
          }, {
            loader: 'less-loader'
          } ]
        },

        {
          test: /\.module\.css$/,
          use: [ {
            loader: 'style-loader',
          }, {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: "[local]___[hash:base64:5]",
            },
          } ]
        },
        {
          test: /\.css$/,
          exclude: /\.module\.less$/,
          use: [ {
            loader: 'style-loader',
          }, {
            loader: 'css-loader'
          } ]
        },

        {
          test: /\.md$/,
          use: [
            {
              loader: require.resolve( '../loader/md2rgl' ),
            },
            {
              loader: require.resolve( '../loader/md' ),
              options: {
                gfm: true,
              },
            },
            {
              loader: require.resolve( '../loader/strip-fm' ),
            },
          ]
        },

        {
          test: /\.js$/,
          exclude: [ /node_modules/ ],
          use: [
            {
              loader: 'babel-loader',
              options: {
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
                  [ require.resolve( '@babel/plugin-transform-runtime' ) ]
                ]
              }
            },
            {
              loader: require.resolve( '../loader/strip-fm' ),
            },
          ]
        },

        {
          test: /\.(png|jpg|gif)$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192
              }
            }
          ]
        },

        {
          test: /\.(ttf|eot|woff|woff2|svg)(\?t=\d+)?$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192
              }
            }
          ]
        },

        {
          test: /\.vue$/,
          use: [
            {
              loader: require.resolve( '../loader/vue-mount' ),
              options: {
                routes: [],
              },
            },
            {
              loader: 'vue-loader',
              options: {},
            },
            {
              loader: require.resolve( '../loader/strip-fm' ),
            },
          ]
        },
      ]
    },
    plugins: [
      new CopyPlugin( [
        {
          from: {
            glob: '**/*',
            dot: true
          },
          context: path.join( dirs.project, 'src/public' ),
          to: '.',
          ignore: [ '.DS_Store' ]
        }
      ] ),
      new HtmlWebpackPlugin( {
        template: path.join( __dirname, './template.html' ),
        title: ( config.html && config.html.title ) || config.zh || config.en,
        favicon: ( config.html && config.html.favicon ) || path.join( __dirname, '../runtime/favicon.png' ),
      } ),
      new VueLoaderPlugin(),
      new WebpackBar(),
    ],
  }

  return webpackConfig
}
