class Plugin {
  constructor( { drivers } ) {
    this._drivers = drivers
  }

  // TODO: find ancestor driver
  use( driverName ) {
    const driver = this._drivers.find(
      driver => driver.constructor.name() === driverName
    )

    return driver.use()
  }

  // override
  static name() {}
  apply() {} // required
}

module.exports = Plugin
