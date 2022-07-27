const BaseModel = require("./base/dynamo-db");
class UserSettingsModel extends BaseModel {
    tableName = "usersettings";

    updateOrCreate(keys, attributes, callback) {
        this.documentClient.query(
            {
                TableName: this.tableName,
                KeyConditionExpression: "#id = :id and #name = :name",
                ExpressionAttributeNames: {
                    "#id": "user#organisation",
                    "#name": "name",
                },
                ExpressionAttributeValues: {
                    ":id": keys["user#organisation"],
                    ":name": keys.name,
                },
            },
            (err, data) => {
                // Error occurred
                if (err) {
                    callback(err, null);
                    return;
                }

                // Create or update?
                if (data.Count === 0) {
                    attributes = Object.assign(attributes, keys);
                    this.create(attributes, callback);
                } else {
                    this.update(keys, attributes, callback);
                }
            }
        );
    }
}

module.exports = UserSettingsModel;
