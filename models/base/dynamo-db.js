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
    //Is array?
    if (!(attributes instanceof Array)) {
      //Create item
      new this.AWS.DynamoDB().putItem(
        {
          TableName: this.tableName,
          Item: this.AWS.DynamoDB.Converter.marshall(attributes),
        },
        callback
      );
    } else {
      //Setup params
      let params = { RequestItems: {} };
      params.RequestItems[this.tableName] = [];
      attributes.forEach((item) => {
        params.RequestItems[this.tableName].push({
          PutRequest: {
            Item: this.AWS.DynamoDB.Converter.marshall(item),
          },
        });
      });

      //Batch create
      new this.AWS.DynamoDB().batchWriteItem(params, callback);
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
    //Get key names
    let tableKeyNames = Object.keys(tableKeys);

    //Create query with partition key
    let query = {
      TableName: this.tableName,
      KeyConditionExpression: `#${tableKeyNames[0]} = :${tableKeyNames[0]}`,
      ExpressionAttributeNames: {
        ["#" + tableKeyNames[0]]: tableKeyNames[0],
      },
      ExpressionAttributeValues: {
        [":" + tableKeyNames[0]]: tableKeyNames[0],
      },
    };

    //Add secondary key?
    if (tableKeyNames.length > 1) {
      query["KeyConditionExpression"] += `and #${tableKeyNames[1]} = :${tableKeyNames[1]}`;
      query["ExpressionAttributeNames"]["#" + tableKeyNames[1]] = tableKeyNames[1];
      query["ExpressionAttributeValues"][":" + tableKeyNames[1]] = tableKeyNames[1];
    }

    //Make query
    this.documentClient.query(keys, callback);
  }

  update(keys, attributes, callback) {
    DynamoDBHelper.update(this.documentClient, this.tableName, keys, attributes, callback);
  }

  delete(keys, callback) {
    DynamoDBHelper.delete(this.documentClient, this.tableName, keys, callback);
  }
}

module.exports = BaseDDBModel;
