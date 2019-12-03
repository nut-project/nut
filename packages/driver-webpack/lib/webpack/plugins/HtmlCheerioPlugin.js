const HtmlWebpackPlugin = require( 'html-webpack-plugin' )
const cheerio = require( 'cheerio' )

class HtmlCheerioPlugin {
  constructor( callbacks ) {
    this.callbacks = callbacks || []
  }

  apply( compiler ) {
    const process = async data => {
      const callbacks = this.callbacks || []

      await callbacks.reduce( async ( last, callback ) => {
        await last
        const $ = cheerio.load( data.html )
        await callback( $ )
        data.html = $.html()
      }, Promise.resolve() )

      return data
    }

    compiler.hooks.compilation.tap( 'HtmlCheerioPlugin', compilation => {
      if ( HtmlWebpackPlugin.getHooks ) {
        // html-webpack-plugin@4
        HtmlWebpackPlugin
          .getHooks( compilation )
          .beforeEmit
          .tapPromise(
            'HtmlCheerioPlugin',
            process
          )
      } else if ( compilation.hooks.htmlWebpackPluginAfterHtmlProcessing ) {
        // html-webpack-plugin@3
        compilation
          .hooks
          .htmlWebpackPluginAfterHtmlProcessing
          .tapPromise(
            'HtmlCheerioPlugin',
            process
          )
      }
    } )
  }
}

module.exports = HtmlCheerioPlugin
