module.exports = function ( source ) {
  return `
    import Regular from 'regularjs'

    const Page = Regular.extend( {
      template: \`
        <div
          class="markdown-body"
          style="padding: 30px 40px;"
          r-html="{ source }"
        ></div>
      \`,
      config() {
        this.data.source = ${ JSON.stringify( source ) }
      }
    } )

    Page.$$nut = ctx => {
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

    export default Page
  `
}
