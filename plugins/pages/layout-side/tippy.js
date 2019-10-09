import tippy from 'tippy.js'
import 'tippy.js/index.css'

export default function ( Component ) {
  Component.directive( 'r-tippy', {
    link( el, expr ) {
      this.$watch( expr, ( options = {} ) => {
        if ( el._tippy ) {
          el._tippy.destroy()
        }

        tippy( el, {
          content: el.title,
          arrow: true,
          animateFill: false,
          animation: 'perspective',
          ...options
        } )
      } )

      return () => {
        if ( el._tippy ) {
          el._tippy.destroy()
        }
      }
    }
  } )
}
