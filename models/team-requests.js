const BaseModel = require("./base/dynamo-db");
const Generic = require("../generic");
class TeamRequestsModel extends BaseModel {
    tableName = "teamrequests";

    addRequest(attributes, callback) {
        var assignRandomint = Generic.All.getDateTime() + Math.floor(Math.random() * 1e4).toString();
        attributes._id = assignRandomint;
        super.create(attributes, callback);
    }
}

module.exports = TeamRequestsModel;
