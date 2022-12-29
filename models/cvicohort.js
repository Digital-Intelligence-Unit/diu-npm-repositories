const BaseModel = require("./base/dynamo-db");
const uuid = require("uuid");
class CVICohortModel extends BaseModel {
    tableName = "cvi_cohorts";

    accessor(attributes) {
        attributes.id = uuid.v1();
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

    getById(id, callback) {
        if (!(id instanceof Array)) {
            // Create single
            this.getByKeys({ id }, callback);
        } else {
            // Get all by id
            new this.AWS.DynamoDB().batchGetItem({
                RequestItems: {
                    [this.tableName]: {
                        Keys: id.map((item, index) => {
                            const keys = item.split("#");
                            return {
                                cohortName: { S: keys[0] },
                                createdDT: { S: keys[1] }
                            };
                        }, {})
                    }
                }
            }, (error, data) => {
                // Return data
                if (error) { callback(error, null); }
                callback(null, {
                    Items: data.Responses[this.tableName].map((item) => {
                        return this.AWS.DynamoDB.Converter.unmarshall(item);
                    })
                });
            });
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
            query.FilterExpression.push("#username = :username");
            query.ExpressionAttributeNames["#username"] = "username";
            query.ExpressionAttributeValues[":username"] = params.username;
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

module.exports = CVICohortModel;
