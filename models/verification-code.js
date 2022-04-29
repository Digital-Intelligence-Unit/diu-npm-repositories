const BaseModel = require("./base/dynamo-db");
const StringHelper = require("../helpers/string");
class VerificationCodeModel extends BaseModel {
    tableName = "verificationcodes";

    create(attributes, callback) {
        // Generate code
        attributes.code = StringHelper.rand();

        // Store in database
        super.create(attributes, (err) => {
            if (err) {
                callback(err);
            } else {
                callback(null, attributes);
            }
        });
    }

    getCode(code, username, callback) {
        const params = {
            TableName: this.tableName,
            KeyConditionExpression: "#username = :username AND #code = :code",
            ExpressionAttributeNames: {
                "#username": "username",
                "#code": "code",
            },
            ExpressionAttributeValues: {
                ":username": username,
                ":code": code,
            },
        };
        this.documentClient.query(params, callback);
    }

    deleteCode(code, username, callback) {
        const params = {
            TableName: this.tableName,
            Key: {
                code,
                username,
            },
        };
        this.documentClient.delete(params, callback);
    }
}

module.exports = VerificationCodeModel;
