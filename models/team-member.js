const BaseModel = require("./base/dynamo-db");
class TeamMemberModel extends BaseModel {
    tableName = "teammembers";

    create(attributes, callback) {
        // Generate id
        const id = Math.round(new Date().getTime() / 1000) + Math.floor(Math.random() * 1e4).toString();
        attributes["_id"] = id;

        // Create member
        super.create(attributes, callback);
    }

    getByUsername(username, callback) {
        const params = {
            TableName: this.tableName,
            IndexName: "username-index",
            KeyConditionExpression: "#username = :username",
            ExpressionAttributeNames: {
                "#username": "username",
            },
            ExpressionAttributeValues: {
                ":username": username,
            },
        };
        this.documentClient.query(params, callback);
    }

    getByTeamCode(teamcode, callback) {
        const params = {
            TableName: this.tableName,
            IndexName: "teamcode-index",
            KeyConditionExpression: "#teamcode = :teamcode",
            ExpressionAttributeNames: {
                "#teamcode": "teamcode",
            },
            ExpressionAttributeValues: {
                ":teamcode": teamcode,
            },
        };
        this.documentClient.query(params, callback);
    }
}

module.exports = TeamMemberModel;
