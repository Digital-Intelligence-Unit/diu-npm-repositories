const DynamoDBHelper = require("../../helpers/dynamodb");
class BaseDDBModel {
    AWS;
    documentClient;
    tableName = "table_name";

    constructor(AWS = null) {
        this.AWS = AWS || require("../../config/database").connections.dynamodb;
        this.documentClient = new this.AWS.DynamoDB.DocumentClient();
    }

    create(attributes, callback) {
        // Is array?
        if (!(attributes instanceof Array)) {
            // Create item
            new this.AWS.DynamoDB().putItem(
                {
                    TableName: this.tableName,
                    Item: this.AWS.DynamoDB.Converter.marshall(attributes),
                },
                (err, data) => {
                    callback(err, attributes, data);
                }
            );
        } else {
            // Setup params
            const params = { RequestItems: {} };
            params.RequestItems[this.tableName] = [];
            attributes.forEach((item) => {
                params.RequestItems[this.tableName].push({
                    PutRequest: {
                        Item: this.AWS.DynamoDB.Converter.marshall(item),
                    },
                });
            });

            // Batch create
            new this.AWS.DynamoDB().batchWriteItem(params, (err, data) => {
                callback(err, attributes, data);
            });
        }
    }

    get(callback, previousresults, LastEvaluatedKey) {
        const params = {
            TableName: this.tableName,
        };
        if (LastEvaluatedKey) {
            params.ExclusiveStartKey = LastEvaluatedKey;
        }
        let output = previousresults || { Items: [], Count: 0, ScannedCount: 0 };
        this.documentClient.scan(params, (err, result) => {
            if (err) callback(err, null);
            else {
                output = {
                    Items: output.Items.concat(result.Items),
                    Count: output.Count + result.Count,
                    ScannedCount: output.ScannedCount + result.ScannedCount,
                };

                if (typeof result.LastEvaluatedKey !== "undefined") {
                    this.get(callback, output, result.LastEvaluatedKey);
                } else {
                    callback(null, output);
                }
            }
        });
    }

    getByKeys(tableKeys, callback) {
        // Get key names
        const tableKeyNames = Object.keys(tableKeys);

        // Create query with partition key
        const query = {
            TableName: this.tableName,
            KeyConditionExpression: `#${tableKeyNames[0]} = :${tableKeyNames[0]}`,
            ExpressionAttributeNames: {
                ["#" + tableKeyNames[0]]: tableKeyNames[0],
            },
            ExpressionAttributeValues: {
                [":" + tableKeyNames[0]]: tableKeys[tableKeyNames[0]],
            },
        };

        // Add secondary key?
        if (tableKeyNames.length > 1) {
            query["KeyConditionExpression"] += ` and #${tableKeyNames[1]} = :${tableKeyNames[1]}`;
            query["ExpressionAttributeNames"]["#" + tableKeyNames[1]] = tableKeyNames[1];
            query["ExpressionAttributeValues"][":" + tableKeyNames[1]] = tableKeys[tableKeyNames[1]];
        }

        // Make query
        this.documentClient.query(query, callback);
    }

    update(keys, attributes, callback) {
        DynamoDBHelper.update(this.documentClient, this.tableName, keys, attributes, (err, data) => {
            callback(err, attributes, data);
        });
    }

    delete(keys, callback) {
        DynamoDBHelper.delete(this.documentClient, this.tableName, keys, callback);
    }
}

module.exports = BaseDDBModel;
