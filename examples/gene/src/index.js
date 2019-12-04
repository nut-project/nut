import './index.scss'

document.querySelector( '#app' ).innerHTML = `
  Hello World
`
fetch('/api/data1').then((res) => {
    console.log('/api/data1:::', res)
})
fetch('/api/data2').then((res) => {
    console.log('/api/data2:::', res)
})
