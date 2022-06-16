const BaseModel = require("./base/dynamo-db");
class RealTimeSurveillance extends BaseModel {
    tableName = "suicidepreventionindex";

    getByID(index, dateOfBirth, callback) {
        const params = {
            TableName: this.tableName,
            KeyConditionExpression: "#index = :index AND #date_of_birth = :date_of_birth",
            ExpressionAttributeNames: {
                "#date_of_birth": "date_of_birth",
                "#index": "index",
            },
            ExpressionAttributeValues: {
                ":date_of_birth": dateOfBirth,
                ":index": index,
            },
        };
        this.documentClient.query(params, callback);
    }

    create(attributes, callback) {
        attributes = this.prepareData(attributes);
        super.create(attributes, callback);
    }

    update(attributes, callback) {
        attributes = this.prepareData(attributes);
        const keys = {
            index: attributes.index,
            date_of_birth: attributes.date_of_birth,
        };
        delete attributes.index;
        delete attributes.date_of_birth;
        super.update(keys, attributes, callback);
    }

    prepareData(attributes) {
        attributes.date
            ? (attributes.age = this.dateDiffInYears(new Date(attributes.date_of_birth), new Date(attributes.date)))
            : (attributes.age = this.dateDiffInYears(new Date(attributes.date_of_birth), new Date()));
        return attributes;
    }

    dateDiffInYears(dateold, datenew) {
        const ynew = datenew.getFullYear();
        const mnew = datenew.getMonth();
        const dnew = datenew.getDate();
        const yold = dateold.getFullYear();
        const mold = dateold.getMonth();
        const dold = dateold.getDate();
        let diff = ynew - yold;
        if (mold > mnew) diff--;
        else {
            if (mold === mnew) {
                if (dold > dnew) diff--;
            }
        }
        return diff;
    }
}

module.exports = RealTimeSurveillance;
