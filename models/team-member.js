const BaseModel = require("./base/dynamo-db");
const uuid = require("uuid");
class TeamMemberModel extends BaseModel {
    tableName = "teammembers";

    create(attributes, callback) {
        // Generate id
        attributes.id = uuid.v1();

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

    getByTeamCodes(teamcodes, callback) {
        const arrTeamCodes = teamcodes.split(",");
        const objTeamCodes = {};
        // let index = 0;
        let teamCodeContainsString = "";
        arrTeamCodes.forEach(function (code, index) {
            const teamCode = ":teamcode" + index;
            objTeamCodes[teamCode.toString()] = code;
            if (index) {
                teamCodeContainsString += " OR contains (teamcode, :teamcode" + index + ")";
            } else {
                teamCodeContainsString = "contains (teamcode, :teamcode" + index + ")";
            }
        });
        const params = {
            TableName: this.tableName,
            FilterExpression: teamCodeContainsString,
            ExpressionAttributeValues: objTeamCodes,
        };
        this.documentClient.scan(params, callback);
    }

    getByUsernameOrgCode(username, organisation, callback) {
        const params = {
            TableName: this.tableName,
            IndexName: "username-organisation-index",
            ScanIndexForward: false,
            KeyConditionExpression: "#username = :username AND #organisation = :organisation",
            ExpressionAttributeNames: {
                "#username": "username",
                "#organisation": "organisation",
            },
            ExpressionAttributeValues: {
                ":username": username,
                ":organisation": organisation,
            },
        };
        this.documentClient.query(params, callback);
    }
}

module.exports = TeamMemberModel;
