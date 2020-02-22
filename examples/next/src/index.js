import './index.scss'
import App from './app.vue'
import Vue from 'vue'

// document.querySelector( '#app' ).innerHTML = `
//   Hello World
// `

console.log( App )

new Vue( {
  render: h => h( App )
} ).$mount( '#app' )
