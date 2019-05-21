const path = require( 'path' )
const resolveFrom = require( 'resolve-from' )

module.exports = function () {
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
