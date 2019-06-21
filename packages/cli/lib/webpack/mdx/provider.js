// not used currently

export default {
  props: {
    components: Object,
    required: true
  },
  provide() {
    return {
      contextComponents: this.components
    }
  },
  render( h ) {
    return h( 'div', {}, [
      this.$slots.default
    ] )
  }
}
