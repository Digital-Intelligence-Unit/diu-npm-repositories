const BaseModel = require('./base/dynamo-db');
class Organisation extends BaseModel {

    tableName = 'organisations';

    get(params, callback) {
        let query = { 
            TableName: this.tableName,
            ExpressionAttributeNames: {},
            ExpressionAttributeValues: {}
        };

        //Filter by name
        if(params.name) {
            query.FilterExpression = "#name = :name";
            query.ExpressionAttributeNames["#name"] = "name";
            query.ExpressionAttributeValues[":name"] = params.name;
        }

        //Filter by name
        if(params.authmethod) {
            query.FilterExpression = "#authmethod = :authmethod";
            query.ExpressionAttributeNames["#authmethod"] = "authmethod";
            query.ExpressionAttributeValues[":authmethod"] = params.authmethod;
        }

        //Run query
        this.documentClient.scan(query, callback);
    }
}

module.exports = Organisation;