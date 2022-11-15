const BaseModel = require("./base/postgres");
class PBICategory extends BaseModel {
    tableName = "pbi_categories";

    getByName(name, callback) {
        // Select all
        this.query(
            {
                text: `SELECT * FROM ${this.tableName} WHERE category_name LIKE $1`,
                values: ["%" + name + "%"],
            },
            (err, result) => {
                callback(err, result);
            }
        );
    }
}

module.exports = PBICategory;
