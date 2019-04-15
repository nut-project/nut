import Regular from 'regularjs'

const Shell = Regular.extend( {
  template: `
    {#if currentPage && currentPage.type === 'markdown'}
      <div ref="$$view"></div>
    {#else}
      <div>
        <div class="" ref="$$view"></div>
      </div>
    {/if}
  `,

  computed: {
    currentPage() {
      const currentPages = this.getCurrentPages()
      return currentPages[ 0 ]
    },
  },

  getCurrentPages() {
    if ( !this.data.ctx ) {
      return []
    }

    const sidebar = this.data.ctx.app.sidebar
    const found = sidebar.find( s => s.active )

    if ( !found ) {
      return []
    }

    return found.children || []
  },
} )

export default Shell
