const BaseModel = require("./base/dynamo-db");
class AtomicPayloadsModel extends BaseModel {
    tableName = "atomic_payload";

    get(params, callback) {
        // Initialise query
        const query = { TableName: this.tableName };

        // Filter by cohort name
        if (params.type) {
            query.ExpressionAttributeNames = {
                "#type": "type"
            };
            query.ExpressionAttributeValues = {
                ":type": params.type
            };
            query.FilterExpression = "#type = :type";
        }

        // Run query
        this.documentClient.scan(query, callback);
    }
}

module.exports = AtomicPayloadsModel;
