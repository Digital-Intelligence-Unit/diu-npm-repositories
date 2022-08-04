class DynamoDB {
    static update(documentClient, tableName, keys, attributes, callback) {
        // Create update statement
        const params = {
            Key: keys,
            TableName: tableName,
            UpdateExpression: "set",
            ExpressionAttributeNames: {},
            ExpressionAttributeValues: {},
            ReturnValues: "ALL_NEW",
        };

        // Create expression for each field
        Object.entries(attributes).forEach(([key, item]) => {
            const columnName = key.replace("#", "");
            params.UpdateExpression += ` #${columnName} = :${columnName},`;
            params.ExpressionAttributeNames[`#${columnName}`] = key;
            params.ExpressionAttributeValues[`:${columnName}`] = item;
        });
        params.UpdateExpression = params.UpdateExpression.slice(0, -1);

        // Update item
        documentClient.update(params, (err, res) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, res.Attributes || null);
            }
        });
    }

    static delete(documentClient, tableName, keys, callback) {
        documentClient.delete(
            {
                TableName: tableName,
                Key: keys,
                ReturnValues: "ALL_OLD",
            },
            callback
        );
    }
}

module.exports = DynamoDB;
