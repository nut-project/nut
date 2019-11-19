#!/usr/bin/env node

const { startup } = require( '@nut-project/core' )
const { config } = require( '@nut-project/dev-utils' )

;( async function () {
  const userConfigManager = config( 'nut' )
  const userConfig = await userConfigManager.get()

  await startup( userConfig )
} )()
