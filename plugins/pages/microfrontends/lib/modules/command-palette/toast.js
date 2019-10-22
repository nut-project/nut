/* global document */
import Vue from 'vue'
import Toast from '@zeit-ui/vue/lib/toast.common'
import './toast.css'

const ToastComponent = Vue.extend( Toast )

const initArea = () => {
  const area = document.querySelector( '.zi-toast-area' )
  if ( area ) {
    return area
  }
  const _div = document.createElement( 'div' )
  _div.classList.add( 'zi-toast-area' )
  document.body.appendChild( _div )
  return _div
}

const insertToArea = ( area, el, id ) => {
  el.setAttribute( 'id', `zi-toast-${ id }` )
  area.appendChild( el )
}

const destroyToast = ( id, all ) => {
  const el = all ? initArea() : document.querySelector( `#zi-toast-${ id }` )
  if ( !el ) {
    return
  }
  el.setAttribute( 'style', 'opacity: 0;' )
  const timer = setTimeout( () => {
    el.parentElement.removeChild( el )
    clearTimeout( timer )
  }, 500 )
}

const createToast = options => {
  const instance = new ToastComponent( {
    mounted() {
      this.init( options )
    },
  } )
  instance.vm = instance.$mount()
  instance.close = () => destroyToast( instance._uid )
  insertToArea( initArea(), instance.vm.$el, instance._uid )

  // auto remove element
  if ( options.duration || options.duration === undefined ) {
    const t = Number.isNaN( Number( options.duration ) ) ? 4500 : options.duration
    const timer = setTimeout( () => {
      instance.close()
      clearTimeout( timer )
    }, t )
  }
  return instance
}

const assignOptions = ( options, obj ) => {
  const source = typeof options === 'object' ? options : { text: options }
  return Object.assign( {}, source, obj )
}

const hooks = {
  show( options ) {
    return createToast( options )
  },

  success( options ) {
    return this.show( assignOptions( options, { type: 'success' } ) )
  },

  warning( options ) {
    return this.show( assignOptions( options, { type: 'warning' } ) )
  },

  danger( options ) {
    return this.show( assignOptions( options, { type: 'danger' } ) )
  },

  closeAll() {
    destroyToast( 0, true )
  },
}

export default hooks
