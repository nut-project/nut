const path = require( 'path' )
const { CONF } = require( '../config' )
exports.getSceneGroupFile = function () {
  return path.join( process.cwd(), CONF.SCENE_DATA_PATH )
}
exports.getApiListFile = function () {
  return path.join( process.cwd(), CONF.SCENE_API_PATH )
}
exports.getSwitchFile = function () {
  return path.join( process.cwd(), CONF.SCENE_ON )
}
