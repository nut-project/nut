/*
  layout#name
  layout#mount
  layout#unmount
  layout#update
  layout#getMountNode
 */

import events from '../events'

export default {
  _layouts: {},
  _current: null,
  _currentPage: null,
  _root: document.getElementById( '#app' ),

  get root() {
    return this._root
  },

  set root( target ) {
    this._root = target
  },

  get current() {
    return this._current
  },

  set current( value ) {},

  get currentPage() {
    return this._currentPage
  },

  set currentPage( value ) {},

  async register( layout ) {
    const name = layout.name

    await events.emit( 'layout:before-register-layout', layout )

    if ( !this._layouts[ name ] ) {
      this._layouts[ name ] = layout
    }

    await events.emit( 'layout:after-register-layout', layout )
  },

  getLayouts() {
    return this._layouts
  },

  getLayoutByName( name ) {
    return this._layouts[ name ]
  },

  update( name, data = {} ) {
    const node = this._root
    const layout = this.getLayoutByName( name )

    if ( layout ) {
      return layout.update( node, data )
    }
  },

  mount( name, data ) {
    const node = this._root
    const layout = this.getLayoutByName( name )

    this._current = layout

    if ( layout ) {
      return layout.mount( node, data )
    }
  },

  unmount( name ) {
    const node = this._root
    const layout = this.getLayoutByName( name )

    this._current = null

    if ( layout ) {
      return layout.unmount( node )
    }
  },

  getMountNodeByName( name ) {
    const layout = this.getLayoutByName( name )

    if ( layout ) {
      return layout.getMountNode()
    }
  },

  getCurrentMountNode() {
    const current = this._current

    if ( !current ) {
      return
    }

    return this.getMountNodeByName( current.name )
  },

  mountPage( page ) {
    const node = this.getCurrentMountNode()

    if ( !node || !page ) {
      return
    }

    page.mount( node )

    this._currentPage = page
  },

  unmountPage( page ) {
    const node = this.getCurrentMountNode()

    if ( !node || !page ) {
      return
    }

    page.unmount( node )
    this._currentPage = null
  },
}
