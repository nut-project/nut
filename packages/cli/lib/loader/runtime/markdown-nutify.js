export default function ( source ) {
  return {
    $$nut( ctx ) {
      return {
        mount( node ) {
          node.innerHTML = source
        },

        unmount( node ) {
          node.innerHTML = ''
        },
      }
    }
  }
}
