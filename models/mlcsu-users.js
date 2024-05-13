const BaseModel = require("./base/postgres");
class MLCSUUsersModel extends BaseModel {
    tableName = "mlcsu_users";

    create() {}
    updateByPrimaryKey() {}

    getByEmailAddress(emailAddress, callback) {
        // Select all
        this.query({
            text: `SELECT * FROM ${this.tableName} WHERE email_address = $1`,
            values: [emailAddress]
        }, callback);
    }
}

module.exports = MLCSUUsersModel;
