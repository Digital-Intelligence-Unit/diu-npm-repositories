const BaseModel = require("./base/postgres");
class PBIUploader extends BaseModel {
    tableName = "pbi_uploaders";
    primaryKey = "id";

    getByOwner(owner, callback) {
        this.query(
            {
                text: `SELECT * FROM ${this.tableName} WHERE owner_id = $1`,
                values: [owner],
            },
            (err, result) => {
                callback(err, result);
            }
        );
    }
}

module.exports = PBIUploader;
