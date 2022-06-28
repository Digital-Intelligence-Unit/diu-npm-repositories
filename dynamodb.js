// @ts-check

function getItemByType(AWS, tablename, type, callback) {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: tablename,
        KeyConditionExpression: "#type = :type",
        ExpressionAttributeNames: {
            "#type": "type",
        },
        ExpressionAttributeValues: {
            ":type": type,
        },
    };
    docClient.query(params, callback);
}

function getItemByKey(AWS, tablename, keyname, keyvalue, callback) {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const KeyConditionExpression = "#" + keyname + " = :" + keyname;
    const ExpressionAttributeNames = updateexpressionnames([keyname]);
    const ExpressionAttributeValues = newexpression([keyname], keyvalue);
    const params = {
        TableName: tablename,
        KeyConditionExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
    };
    docClient.query(params, callback);
}

function getItemByKeys(AWS, tablename, keynames, keyvalues, callback) {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const KeyConditionExpression = "#" + keynames[0] + " = :" + keynames[0] + " AND #" + keynames[1] + " = :" + keynames[1];
    const ExpressionAttributeNames = updateexpressionnames(keynames);
    const ExpressionAttributeValues = newexpressions(keynames, keyvalues);
    const params = {
        TableName: tablename,
        KeyConditionExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
    };
    docClient.query(params, callback);
}

function getItemByIndex(AWS, tablename, keyname, keyvalue, callback) {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const KeyConditionExpression = "#" + keyname + " = :" + keyname;
    const ExpressionAttributeNames = updateexpressionnames([keyname]);
    const ExpressionAttributeValues = newexpression([keyname], keyvalue);
    const params = {
        TableName: tablename,
        IndexName: keyname + "-index",
        KeyConditionExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
    };
    docClient.query(params, callback);
}

function getItemByDualIndex(AWS, tablename, keynames, keyvalues, callback) {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const KeyConditionExpression = "#" + keynames[0] + " = :" + keynames[0] + " AND #" + keynames[1] + " = :" + keynames[1];
    const ExpressionAttributeNames = updateexpressionnames(keynames);
    const ExpressionAttributeValues = newexpressions(keynames, keyvalues);
    const params = {
        TableName: tablename,
        IndexName: keynames[0] + "-" + keynames[1] + "-index",
        KeyConditionExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
    };
    docClient.query(params, callback);
}

function getAll(AWS, tablename, callback) {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: tablename,
    };
    docClient.scan(params, callback);
}

function getAllByFilter(AWS, tablename, filter, callback) {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: tablename,
        FilterExpression: filter,
    };
    docClient.scan(params, callback);
}

function getAllByFilterValue(AWS, tablename, filter, filtername, filtervalue, callback) {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const ExpressionAttributeNames = updateexpressionnames([filtername]);
    const ExpressionAttributeValues = newexpression([filtername], filtervalue);
    const params = {
        TableName: tablename,
        FilterExpression: filter,
        ExpressionAttributeValues,
        ExpressionAttributeNames,
    };
    docClient.scan(params, callback);
}

function getAllByFilterValues(AWS, tablename, filter, filternames, filtervalues, callback) {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const ExpressionAttributeNames = updateexpressionnames(filternames);
    const ExpressionAttributeValues = newexpressions(filternames, filtervalues);
    const params = {
        TableName: tablename,
        FilterExpression: filter,
        ExpressionAttributeValues,
        ExpressionAttributeNames,
    };
    docClient.scan(params, callback);
}

function addItem(AWS, tablename, newItem, callback) {
    const client = new AWS.DynamoDB();
    const params = {
        TableName: tablename,
        Item: newItem,
        ReturnValues: "ALL_NEW",
    };
    client.putItem(params, callback);
}

function removeItem(AWS, tablename, key, callback) {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const getparams = {
        TableName: tablename,
        Key: key,
        ReturnValues: "ALL_OLD",
    };
    docClient.delete(getparams, (err, result) => {
        if (err) callback(err, { status: 400, msg: err });
        else callback(null, { status: 200, msg: result });
    });
}

function updateItem(AWS, tablename, filters, updatedItem, callback) {
    const docClient = new AWS.DynamoDB.DocumentClient();
    let fields = Object.keys(updatedItem);
    fields = fields.filter((x) => !filters.includes(x));
    const update = "set " + updatefields(fields);
    const expressionvals = updateexpression(fields, updatedItem);
    const expressionnames = updateexpressionnames(fields);
    const keys = setkeys(filters, updatedItem);
    const params = {
        TableName: tablename,
        Key: keys,
        UpdateExpression: update,
        ExpressionAttributeValues: expressionvals,
        ExpressionAttributeNames: expressionnames,
        ReturnValues: "UPDATED_NEW",
    };
    docClient.update(params, callback);
}

function setkeys(fields, item) {
    const exp = {};
    fields.forEach((val) => {
        exp[val] = item[val];
    });
    return exp;
}

function updatefields(fields) {
    let output = "";
    fields.forEach((val) => {
        output += "#" + val + "=:" + val + ",";
    });
    return output.substring(0, output.length - 1);
}

function updateexpression(fields, newItem) {
    const exp = {};
    fields.forEach((val) => {
        exp[":" + val] = newItem[val];
    });
    return exp;
}

function newexpression(fields, newItem) {
    const exp = {};
    fields.forEach((val) => {
        exp[":" + val] = newItem;
    });
    return exp;
}

function newexpressions(fields, items) {
    const exp = {};
    for (let index = 0; index < fields.length; index++) {
        exp[":" + fields[index]] = items[index];
    }
    return exp;
}

function updateexpressionnames(fields) {
    const exp = {};
    fields.forEach((val) => {
        exp["#" + val] = val;
    });
    return exp;
}

function selectFunction(functionname) {
    switch (functionname) {
        case "updateItem":
            return updateItem;
        case "removeItem":
            return removeItem;
        case "addItem":
            return addItem;
        case "getAll":
            return getAll;
        case "getItemByType":
            return getItemByType;
        case "getItemByKey":
            return getItemByKey;
        case "getItemByKeys":
            return getItemByKeys;
        case "getItemByIndex":
            return getItemByIndex;
        case "getAllByFilter":
            return getAllByFilter;
        case "getItemByDualIndex":
            return getItemByDualIndex;
        case "getAllByFilterValue":
            return getAllByFilterValue;
        case "getAllByFilterValues":
            return getAllByFilterValues;
        default:
            return () => {
                return functionname + " not implemented.";
            };
    }
}

module.exports.All = {
    updateItem,
    removeItem,
    addItem,
    getAll,
    getItemByType,
    getItemByKey,
    getItemByKeys,
    getItemByIndex,
    getAllByFilter,
    getItemByDualIndex,
    getAllByFilterValue,
    getAllByFilterValues,
    selectFunction,
};
