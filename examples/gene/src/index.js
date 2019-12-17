import './index.scss'
import App from './app.vue'
import Vue from 'vue'

document.querySelector( '#app' ).innerHTML = `
  Hello World
`
fetch('/api/data1').then((res) => {
    console.log('/api/data1:::', res)
})
fetch('/api/data2').then((res) => {
    console.log('/api/data2:::', res)
})

console.log( App )

new Vue( {
  render: h => h( App )
} ).$mount( '#app' )
