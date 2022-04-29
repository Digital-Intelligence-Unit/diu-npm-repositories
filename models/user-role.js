// Model to be deprecated
function updatefields(fields) {
    let output = "";
    fields.forEach((val) => {
        output += "#" + val + "=:" + val + ",";
    });
    return output.substring(0, output.length - 1);
}

function updateexpression(fields, updateItem) {
    const exp = {};
    fields.forEach((val) => {
        exp[":" + val] = updateItem[val];
    });
    return exp;
}

function updateexpressionnames(fields) {
    const exp = {};
    fields.forEach((val) => {
        exp["#" + val] = val;
    });
    return exp;
}

const BaseModel = require("./base/dynamo-db");
class UserRoleModel extends BaseModel {
    tableName = "userroles";

    getByID(username, roleassignedDT, callback) {
        const params = {
            TableName: this.tableName,
            KeyConditionExpression: "#username = :username AND #roleassignedDT = :roleassignedDT",
            ExpressionAttributeNames: {
                "#roleassignedDT": "roleassignedDT",
                "#username": "username",
            },
            ExpressionAttributeValues: {
                ":roleassignedDT": roleassignedDT,
                ":username": username,
            },
        };
        this.documentClient.query(params, callback);
    }

    getItemsByUsername(username, callback) {
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

    getItemsByUsernameAndOrgID(username, organisationid, callback) {
        const params = {
            TableName: this.tableName,
            IndexName: "username-organisation-index",
            KeyConditionExpression: "#username = :username AND #organisationid = :organisationid",
            ExpressionAttributeNames: {
                "#username": "username",
                "#organisationid": "organisationid",
            },
            ExpressionAttributeValues: {
                ":username": username,
                ":organisationid": organisationid,
            },
        };
        this.documentClient.query(params, callback);
    }

    getAll(callback) {
        const params = {
            TableName: this.tableName,
        };
        this.documentClient.scan(params, callback);
    }

    addItem(newItem, callback) {
        const params = {
            TableName: this.tableName,
            Item: newItem,
        };
        new this.AWS.DynamoDB().putItem(params, callback);
    }

    removeItem(username, roleassignedDT, callback) {
        const getparams = {
            TableName: this.tableName,
            Key: {
                username,
                roleassignedDT,
            },
        };
        this.documentClient.delete(getparams, (err, result) => {
            if (err) callback(err, { status: 400, msg: err });
            else callback(null, { status: 200, msg: result });
        });
    }

    updateItem(updatedItem, callback) {
        const fields = Object.keys(updatedItem);
        fields.splice(fields.indexOf("username"), 1);
        fields.splice(fields.indexOf("roleassignedDT"), 1);
        const update = "set " + updatefields(fields);
        const expressionvals = updateexpression(fields, updatedItem);
        const expressionnames = updateexpressionnames(fields);
        const params = {
            TableName: this.tableName,
            Key: {
                username: updatedItem.username,
                roleassignedDT: updatedItem.roleassignedDT,
            },
            UpdateExpression: update,
            ExpressionAttributeValues: expressionvals,
            ExpressionAttributeNames: expressionnames,
            ReturnValues: "UPDATED_NEW",
        };
        // @ts-ignore
        this.documentClient.update(params, callback);
    }

    updateArchive(updatedItem, callback) {
        const params = {
            TableName: this.tableName + "_archive",
            Item: updatedItem,
        };
        new this.AWS.DynamoDB().putItem(params, callback);
    }
}

module.exports = UserRoleModel;
