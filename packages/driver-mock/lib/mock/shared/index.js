const path = require( 'path' )
const { CONF } = require( '../config' )
exports.getSceneGroupFile = function () {
  return path.join( process.cwd(), CONF.SCENE_DATA_PATH )
}
exports.getApiFile = function () {
  return path.join( process.cwd(), CONF.SCENE_API_PATH )
}
exports.getApiListFile = function () {
  return path.join( process.cwd(), CONF.SCENE_API_LIST_PATH )
}
