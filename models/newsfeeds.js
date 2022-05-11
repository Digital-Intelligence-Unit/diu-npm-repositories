const BaseModel = require("./base/dynamo-db");
const uuid = require("uuid");
class NewsfeedsModel extends BaseModel {
    tableName = "newsfeeds";
}

module.exports = NewsfeedsModel;
