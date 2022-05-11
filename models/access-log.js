const BaseModel = require("./base/dynamo-db");
const uuid = require("uuid");
class AccessLog extends BaseModel {
    tableName = "access_logs";

    // attributes = { type: "Log type", user: { username: "", organisation: "" }, data: "Additional data" }
    // attributes = Array<{ type: "Log type", user: { username: "", organisation: "" }, data: "Additional data" }>
    create(attributes, callback) {
        // Accessor function
        const accessor = (newAttributes) => {
            return {
                date: new Date().toISOString().split("T")[0],
                uuid: new Date().toISOString().substr(11, 8) + "#" + uuid.v1(),
                "username#org": `${newAttributes.user.username}#${newAttributes.user.organisation}`,
                type: newAttributes.type,
                time: new Date().toISOString().substr(11, 8),
                data: newAttributes.data,
            };
        };
        // Is array?
        if (!(attributes instanceof Array)) {
            // Create single
            super.create(accessor(attributes), callback);
        } else {
            // Loop and edit
            attributes.forEach((model, index, models) => {
                models[index] = accessor(model);
            });
            // Batch create
            super.create(attributes, callback);
        }
    }

    getByDate(params, callback) {
        const query = {
            TableName: this.tableName,
        };

        // Filter by date
        query.KeyConditionExpression = "#date = :date";
        query.ExpressionAttributeNames = {
            "#date": "date",
        };
        query.ExpressionAttributeValues = {
            ":date": params.date || new Date().toISOString().split("T")[0],
        };

        // Get by page
        if (params.pageKey) {
            query.ExclusiveStartKey = JSON.parse(params.pageKey);
        }

        // Limit items
        if (params.limit) {
            query.Limit = params.limit || 100;
        }

        // Run query
        this.documentClient.query(query, callback);
    }

    getByUser(params, callback) {
        const query = {
            TableName: this.tableName,
            IndexName: "username-org-date-index",
            ScanIndexForward: false,
        };

        // Filter by date
        query.KeyConditionExpression = "#user = :user";
        query.ExpressionAttributeNames = {
            "#user": "username#org",
        };
        query.ExpressionAttributeValues = {
            ":user": params.user,
        };

        // Filter by date?
        if (params.date) {
            query.KeyConditionExpression += " and begins_with(#date, :date)";
            query.ExpressionAttributeNames["#date"] = "date";
            query.ExpressionAttributeValues[":date"] = params.date;
        }

        // Get by page
        if (params.pageKey) {
            query.ExclusiveStartKey = JSON.parse(params.pageKey);
        }

        // Limit items
        if (params.limit) {
            query.Limit = params.limit || 100;
        }

        // Run query
        this.documentClient.query(query, callback);
    }

    getByType(params, callback) {
        const query = {
            TableName: this.tableName,
            IndexName: "type-date-index",
            ScanIndexForward: false,
        };

        // Filter by type
        query.KeyConditionExpression = "#type = :type";
        query.ExpressionAttributeNames = {
            "#type": "type",
        };
        query.ExpressionAttributeValues = {
            ":type": params.type,
        };

        // Filter by date?
        if (params.date) {
            query.KeyConditionExpression += " and begins_with(#date, :date)";
            query.ExpressionAttributeNames["#date"] = "date";
            query.ExpressionAttributeValues[":date"] = params.date;
        }

        // Get by page
        if (params.pageKey) {
            query.ExclusiveStartKey = JSON.parse(params.pageKey);
        }

        // Limit items
        if (params.limit) {
            query.Limit = params.limit || 100;
        }

        // Run query
        this.documentClient.query(query, callback);
    }
}

module.exports = AccessLog;
