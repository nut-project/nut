const { getData } = require( './get-data' )
const { getAllData } = require( './get-all-data' )
const { updateData } = require( './update-data' )
const { getSceneGroup } = require( './get-scene-group' )
const { updateSceneGroup } = require( './update-scene-group' )
const { getApiList } = require( './get-apilist' )
const { getApiScene } = require( './get-api-scene' )

exports.ruleMatchApi = {
  getData,
  getAllData,
  updateData,
  getSceneGroup,
  updateSceneGroup,
  getApiList,
  getApiScene
}
