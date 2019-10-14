const defaults = {
  inlineCode: 'code',
  wrapper: 'div'
}

export default {
  props: {
    name: String,
    components: {
      type: Object,
      default: () => ( {} )
    },
    cprops: {
      type: Object,
      default: () => ( {} )
    },
    Layout: Object,
    layoutProps: {
      type: Object,
      default: () => ( {} )
    },
  },
  inject: {
    contextComponents: {
      default: {}
    }
  },
  render( h ) {
    if ( this.Layout ) {
      return h( this.Layout, {
        props: {
          attrs: this.layoutProps
        }
      }, [ this.$slots.default ] )
    }

    // eslint-disable-next-line
    const Component =
      this.components[ this.name ] ||
      // this.contextComponents[ this.name ] ||
      defaults[ this.name ] ||
      this.name
    const childProps = { ...this.cprops }

    const options = {
      attrs: childProps,
      props: childProps,
    }

    if ( childProps.class ) {
      options.class = childProps.class.split( /\s+/ )
    }

    return h( Component, options, [ this.$slots.default ] )
  }
}
