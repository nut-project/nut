let world: string = 'world'

export default {
  $$nut: function ( ctx ) {
    return {
      mount( node ) {
        node.innerText = 'hello ' + world
      },

      unmount( node ) {
        node.innerText = ''
      },
    }
  }
}
