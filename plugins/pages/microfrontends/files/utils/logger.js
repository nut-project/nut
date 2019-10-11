export default {
  success( scope, message ) {
    console.log(
      '\n%c' + scope + '%c' + message + '%c\n',
      'background-color: #0089ff;color: #fff;padding: 2px 6px;',
      'background-color: #3c3e6f;color: #fff;padding: 2px 6px;',
      ''
    )
  },

  error( scope, message ) {
    console.log(
      '\n%c' + scope + '%c' + message + '%c\n',
      'background-color: #ff8787;color: #fff;padding: 2px 6px;',
      'background-color: #e74d54;color: #fff;padding: 2px 6px;',
      ''
    )
  },

  warning( scope, message ) {
    console.log(
      '\n%c' + scope + '%c' + message + '%c\n',
      'background-color: #eccd70;color: #fff;padding: 2px 6px;',
      'background-color: #e6ba50;color: #fff;padding: 2px 6px;',
      ''
    )
  },

  info( scope, message ) {
    console.log(
      '\n%c' + scope + '%c' + message + '%c\n',
      'background-color: #0089ff;color: #fff;padding: 2px 6px;',
      'background-color: #3c3e6f;color: #fff;padding: 2px 6px;',
      ''
    )
  },
}
