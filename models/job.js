const BaseModel = require("./base/dynamo-db");
const Luxon = require("luxon");
const { ulid } = require("ulidx");

class Job extends BaseModel {
    tableName = "jobs";

    create(attributes, callback) {
        // Add missing values
        const job = Object.assign({}, {
            id: ulid(Luxon.DateTime.now().toMillis()),
            timestamp: Luxon.DateTime.now().toISO(),
            "owner#type": attributes.owner + "#pbi_data_upload",
        }, attributes);

        // Create new item
        super.create(job, callback);
    }

    getByOwnerAndType(filters, callback) {
        this.documentClient.query(
            {
                TableName: this.tableName,
                IndexName: "owner-type-id-index",
                KeyConditionExpression: "#ownerType = :ownerType",
                ExpressionAttributeNames: {
                    "#ownerType": "owner#type",
                },
                ExpressionAttributeValues: {
                    ":ownerType": filters.owner + "#" + filters.type,
                },
                Limit: 30,
                ScanIndexForward: false
            },
            (err, data) => {
                // Error occurred
                if (err) {
                    callback(err, null);
                    return;
                }

                // Create or update?
                callback(null, data);
            }
        );
    }
}

module.exports = Job;
