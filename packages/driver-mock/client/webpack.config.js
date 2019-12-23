// const MonacoEditorPlugin = require('monaco-editor-webpack-plugin')
const path = require( 'path' )
const VueLoaderPlugin = require( 'vue-loader/lib/plugin' )
module.exports = {
  mode: 'production',
  entry: path.join( __dirname, './src/index.js' ),
  output: {
    path: path.join( __dirname, './dist' ),
    filename: 'main.js'
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js' // 内部为正则表达式  vue结尾的
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    // new MonacoEditorPlugin({
    // // https://github.com/Microsoft/monaco-editor-webpack-plugin#options
    //     languages: ['javascript']
    // })
  ]
}
