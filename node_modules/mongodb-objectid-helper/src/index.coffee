bson = require "bson"
ObjectId = bson.ObjectId


module.exports.isObjectId = (nameOrId) ->
  return false unless nameOrId
  nameOrId = nameOrId.toString()
  return false unless nameOrId.length is 24
  try
    return !!(new ObjectId(nameOrId))
  catch e
    false

