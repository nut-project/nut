const { CLI } = require( '@nut-project/core' )

class PagesCLI extends CLI {
  static name() {
    return 'pages'
  }

  commands() {
    return [
      { command: 'dev', description: 'Build in development mode' },
      { command: 'build', description: 'Build in production mode' }
    ]
  }
}

module.exports = PagesCLI
