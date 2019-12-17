const { getSwitchFile } = require( './shared' )
const fs = require( 'fs-extra' )

exports.getSwitch = async function () {
  const switchFile = getSwitchFile()
  let switchObj = {}
  try {
    await fs.ensureFile( switchFile )
    switchObj = await fs.readJson( switchFile, { throws: false } )
    return {
      retCode: 200,
      retDesc: 'success',
      data: switchObj || {}
    }
  } catch ( err ) {
    return {
      error: err
    }
  }
}
