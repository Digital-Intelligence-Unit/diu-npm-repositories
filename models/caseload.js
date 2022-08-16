const BaseModel = require("./base/dynamo-db");
const uuid = require("uuid");
class CaseloadModel extends BaseModel {
    tableName = "caseloads";

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
            query.ExpressionAttributeNames["#name"] = "name";
            query.ExpressionAttributeValues[":name"] = params.name;
            query.FilterExpression.push("contains(#name, :name)");
        }

        // Filter by username
        if (params.username) {
            query.FilterExpression.push("#user = :user");
            query.ExpressionAttributeNames["#user"] = "username#organisation";
            query.ExpressionAttributeValues[":user"] = params.username;
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

    updateTotal({ id, count, operator = "=" }, callback) {
        if (operator === "=") {
            // Set total
            this.update({ id }, { total: count }, callback);
        } else {
            // Increment/Decrement
            this.documentClient.update({
                Key: { id },
                TableName: this.tableName,
                ExpressionAttributeNames: { "#total": "total" },
                ExpressionAttributeValues: { ":count": count },
                UpdateExpression: `SET #total = #total ${operator} :count`,
                ReturnValues: "ALL_NEW"
            }, (err, res) => {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, res.Attributes || null);
                }
            });
        }
    }

    delete(keys, callback) {
        // Delete caseload patients
        const CaseloadPatientModel = new (require("./caseload_patient"))();
        CaseloadPatientModel.deleteByCaseloadId(keys.id, (patientsDeleteError) => {
            // Error?
            if (patientsDeleteError) {
                callback(patientsDeleteError, null);
            }

            // Delete caseload
            super.delete(keys, callback);
        });
    }
}

module.exports = CaseloadModel;
