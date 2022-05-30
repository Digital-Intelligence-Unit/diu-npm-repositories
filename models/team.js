const BaseModel = require("./base/dynamo-db");
const StringHelper = require("../helpers/string");
class TeamModel extends BaseModel {
    tableName = "teams";

    getByFilters(filters, callback) {
        // Initialise query
        const query = { TableName: this.tableName };

        // Has filters?
        if (Object.values(filters).length > 0) {
            query.ExpressionAttributeNames = {};
            query.ExpressionAttributeValues = {};
            query.FilterExpression = [];
        }

        // Filter by name
        if (filters.name) {
            query.ExpressionAttributeNames["#name"] = "name";
            query.ExpressionAttributeValues[":name"] = filters.name;
            query.ExpressionAttributeValues[":name_uc"] = StringHelper.ucfirst(filters.name);
            query.FilterExpression.push("(contains(#name, :name) OR contains(#name, :name_uc))");
        }

        // Filter by orgcode
        if (filters.orgcode) {
            query.ExpressionAttributeNames["#organisationcode"] = "organisationcode";
            query.ExpressionAttributeValues[":organisationcode"] = filters.orgcode;
            query.FilterExpression.push("#organisationcode = :organisationcode");
        }

        // Join filters
        if (query.FilterExpression) {
            query.FilterExpression = query.FilterExpression.join(" and ");
        }

        // Run query
        this.documentClient.scan(query, callback);
    }

    getByCode(code, callback) {
        require("../dynamodb").All.getItemByIndex(this.AWS, this.tableName, "code", code, callback);
    }

    getByOrg(org, callback) {
        require("../dynamodb").All.getItemByIndex(this.AWS, this.tableName, "organisationcode", org, callback);
    }

    delete(keys, callback) {
        const RoleLinkModel = new (require("./role-link"))();
        const CapabilityLinkModel = new (require("./capability-link"))();

        // Delete linked roles
        RoleLinkModel.deleteByLinkId("team", keys.code, (err, result) => {
            if (err) {
                callback(err, null);
                return;
            }

            // Delete linked capabilities
            CapabilityLinkModel.deleteByLinkId("team", keys.code, (errDelete) => {
                if (err) {
                    callback(errDelete, null);
                    return;
                }

                // Delete team
                super.delete(keys, callback);
            });
        });
    }
}

module.exports = TeamModel;
