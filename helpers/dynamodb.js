class DynamoDB {
    static update(documentClient, tableName, keys, attributes, callback) {
        //Create update statement
        let params = {
            Key: keys,
            TableName: tableName,
            UpdateExpression: 'set',
            ExpressionAttributeNames: {},
            ExpressionAttributeValues: {},
            ReturnValues: "ALL_NEW"
        }

        //Create expression for each field
        Object.entries(attributes).forEach(([key, item]) => {
            params.UpdateExpression += ` #${key} = :${key},`;
            params.ExpressionAttributeNames[`#${key}`] = key;
            params.ExpressionAttributeValues[`:${key}`] = item
        });
        params.UpdateExpression = params.UpdateExpression.slice(0, -1);

        //Update item
        documentClient.update(params, (err, res) => {
            if(err) {
                callback(err, null);
            } else {
                callback(null, res.Attributes || null);
            }
        });
    }

    static delete(documentClient, tableName, keys, callback) {
        documentClient.delete({
            TableName: tableName, Key: keys,
        }, callback);
    }
}

module.exports = DynamoDB;