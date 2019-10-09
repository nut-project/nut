const Runtime = require( './runtime' )

class Core {
  constructor( options ) {
    this.options = options
  }

  async apply() {
    const runtime = new Runtime()
    await runtime.apply( this )
  }

  get dev() {
    return this.options.env === 'development'
  }

  get env() {
    return this.options.env
  }

  get scope() {
    return this.options.scope
  }

  get cliOptions() {
    return this.options.cliOptions || {}
  }
}

module.exports = Core
