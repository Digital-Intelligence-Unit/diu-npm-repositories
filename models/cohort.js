const BaseModel = require("./base/dynamo-db");
const uuid = require("uuid");
class CohortModel extends BaseModel {
    tableName = "cohorts";

    accessor(attributes) {
        attributes["_id"] = uuid.v1();
        return attributes;
    }

    create(attributes, callback) {
        // Is array?
        if (!(attributes instanceof Array)) {
            // Create single
            super.create(this.accessor(attributes), callback);
        } else {
            // Loop and edit
            attributes.forEach((model, index, models) => {
                models[index] = this.accessor(model);
            });

            // Batch create
            super.create(attributes, callback);
        }
    }

    get(params, callback) {
        // Initialise query
        const query = { TableName: this.tableName };

        // Has filters?
        if (Object.values(params).length > 0) {
            query.ExpressionAttributeNames = {};
            query.ExpressionAttributeValues = {};
            query.FilterExpression = [];
        }

        // Filter by cohort name
        if (params.name) {
            query.FilterExpression.push("#cohortName = :cohortName");
            query.ExpressionAttributeNames["#cohortName"] = "cohortName";
            query.ExpressionAttributeValues[":cohortName"] = params.name;
        }

        // Filter by username
        if (params.username) {
            query.FilterExpression.push("#user = :user");
            query.ExpressionAttributeNames["#user"] = "user";
            query.ExpressionAttributeValues[":user"] = params.username;
        }

        // Filter by teamcode
        if (params.teamcode) {
            query.FilterExpression.push("#teamcode = :teamcode");
            query.ExpressionAttributeNames["#teamcode"] = "teamcode";
            query.ExpressionAttributeValues[":teamcode"] = params.teamcode;
        }

        // Join filters
        if (query.FilterExpression) {
            query.FilterExpression = query.FilterExpression.join(" and ");
        }

        // Run query
        this.documentClient.scan(query, callback);
    }
}

module.exports = CohortModel;
