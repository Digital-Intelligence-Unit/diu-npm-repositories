const BaseModel = require("./base/dynamo-db");
const Generic = require("../generic");
class UserProfileModel extends BaseModel {
    tableName = "userprofiles";

    getByUsername(username, callback) {
        // Run query
        this.documentClient.query(
            {
                TableName: this.tableName,
                IndexName: "username-index",
                KeyConditionExpression: "#username = :username",
                ExpressionAttributeNames: {
                    "#username": "username",
                },
                ExpressionAttributeValues: {
                    ":username": username,
                },
            },
            callback
        );
    }

    addUserProfile(newUserProfile, callback) {
        var assignRandomint = Generic.All.getDateTime() + Math.floor(Math.random() * 1e4).toString();
        newUserProfile._id = { S: assignRandomint };
        this.create(newUserProfile, callback);
    }
}

module.exports = UserProfileModel;
