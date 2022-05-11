const DynamoDBHelper = require("../../helpers/dynamodb");
class BaseDDBModel {
    AWS;
    documentClient;
    tableName = "table_name";

    constructor(AWS = null) {
        this.AWS = AWS || require("../../config/database").connections.dynamodb;
        this.documentClient = new this.AWS.DynamoDB.DocumentClient();
        this.dynamodb = new this.AWS.DynamoDB();
    }

    getAllTables(callback) {
        this.dynamodb.listTables({}, function (err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                callback(data);
            }
        });
    }

    getTableSchema(tableName) {
        const _self = this;
        return new Promise(function (resolve, reject) {
            _self.dynamodb.describeTable({ TableName: tableName }, function (err, data) {
                if (err) {
                    // console.error("Unable to describe table. Error JSON:", JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    // callback(data);
                    resolve(data);
                }
            });
        });
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

    get(callback) {
        this.documentClient.scan(
            {
                TableName: this.tableName,
            },
            callback
        );
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
