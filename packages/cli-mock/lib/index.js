const { CLI } = require( '@nut-project/core' )

class MockCLI extends CLI {
  static name() {
    return 'mock'
  }

  commands() {
    return [
      { command: '', description: 'start a mock server' },
    ]
  }
}

module.exports = MockCLI
