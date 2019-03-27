module.exports = function ( source ) {
  return `
    import Regular from 'regularjs'

    export default Regular.extend( {
      template: \`
        <div
          class="markdown-body"
          style="padding: 30px 40px;"
        >
          ${ source }
        </div>
      \`
    } )
  `
}
