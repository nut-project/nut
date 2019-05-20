module.exports = function ( source ) {
  if ( /export\s+default/.test( source ) ) {
    return source
  }

  return `
${ source }

export default {
  render() {
    return h( 'div', {}, this.$slots.default )
  }
}
  `
}
