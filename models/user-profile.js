const BaseModel = require("./base/dynamo-db");
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
}

module.exports = UserProfileModel;
