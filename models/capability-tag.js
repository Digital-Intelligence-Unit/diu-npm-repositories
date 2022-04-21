const BaseModel = require('./base/dynamo-db');
class CapabilityTagModel extends BaseModel {

    tableName = 'capability_tags';

    //All methods inherited
}

module.exports = CapabilityTagModel;