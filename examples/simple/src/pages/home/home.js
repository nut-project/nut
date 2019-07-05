import Regular from 'regularjs'
import styles from './home.module.scss'

const Page = Regular.extend( {
  template: `
    <div class="${ styles.home_scss_test }">home</div>
  `
} )

Page.$$nut = function ( ctx ) {
  let instance

  return {
    mount( node ) {
      if ( !instance ) {
        instance = new Page()
      }
      instance.$inject( node )

      const obj = {
        foo: {
          bar: {
            baz: 'world',
          },
        },
      };

      const baz = obj?.foo?.bar?.baz;

      console.log( baz )
    },

    unmount( node ) {
      instance.$inject( false )
    },

    // beforeLeave() {
    //
    // },

    enter() {
      import( './components/style' ).then( () => {
        console.log( 'style loaded' )
      } )
    },
  }
}

export default Page
