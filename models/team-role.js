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
class TeamRoleModel extends BaseModel {
    tableName = "teamroles";

    getByID(teamcode, roleassignedDT, callback) {
        const params = {
            TableName: this.tableName,
            KeyConditionExpression: "#teamcode = :teamcode AND #roleassignedDT = :roleassignedDT",
            ExpressionAttributeNames: {
                "#roleassignedDT": "roleassignedDT",
                "#teamcode": "teamcode",
            },
            ExpressionAttributeValues: {
                ":roleassignedDT": roleassignedDT,
                ":teamcode": teamcode,
            },
        };
        this.documentClient.query(params, callback);
    }

    getItemsByTeamcode(teamcode, callback) {
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

    getItemsByTeamcodes(teams, callback) {
        const expressionAttributeValues = {};
        const userIdParams = teams
            .map((u, i) => {
                const userParam = `:team${i}`;
                expressionAttributeValues[userParam] = u;
                return userParam;
            })
            .join(",");
        const params = {
            TableName: this.tableName,
            FilterExpression: "#teamcode IN (" + userIdParams + ")",
            ExpressionAttributeNames: {
                "#teamcode": "teamcode",
            },
            ExpressionAttributeValues: expressionAttributeValues,
        };
        this.documentClient.scan(params, callback);
    }

    // To-do: change to get method
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

    removeItem(teamcode, roleassignedDT, callback) {
        const getparams = {
            TableName: this.tableName,
            Key: {
                teamcode,
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
        fields.splice(fields.indexOf("teamcode"), 1);
        fields.splice(fields.indexOf("roleassignedDT"), 1);
        const update = "set " + updatefields(fields);
        const expressionvals = updateexpression(fields, updatedItem);
        const expressionnames = updateexpressionnames(fields);
        const params = {
            TableName: this.tableName,
            Key: {
                teamcode: updatedItem.teamcode,
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

module.exports = TeamRoleModel;
