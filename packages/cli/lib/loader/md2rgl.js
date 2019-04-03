module.exports = function ( source ) {
  return `
    import Regular from 'regularjs'

    const Page = Regular.extend( {
      template: \`
        <div
          class="markdown-body"
          style="padding: 30px 40px;"
        >
          ${ source }
        </div>
      \`
    } )

    export default ctx => {
      let instance

      return {
        mount( node ) {
          if ( !instance ) {
            instance = new Page()
          }
          instance.$inject( node )
        },

        unmount( node ) {
          if ( !instance ) {
            return
          }
          instance.$inject( false )
        },
      }
    }
  `
}
