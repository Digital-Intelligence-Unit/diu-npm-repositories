const BaseModel = require("./base/dynamo-db");
const uuid = require("uuid");
class AppModel extends BaseModel {
    tableName = "apps";
    removeApp = function (name, env, callback) {
        const key = {
            name: name,
            environment: env,
        };
        this.delete(key, callback);
    };

    getAppByName = function (name, callback) {
        this.getByKeys({ name: name }, callback);
    };

    getAppByOwner = function (owner, callback) {
        this.getByKeys({ ownerName: owner }, callback);
    };

    getAppByStatus = function (status, callback) {
        this.getByKeys({ status: status }, callback);
    };

    getAll = function (callback) {
        this.get(callback);
    };

    addApp = function (newApp, callback) {
        this.create(newApp, callback);
    };

    updateApp = function (updatedItem, callback) {
        this.update(["name", "environment"], updatedItem, callback);
    };
}

module.exports = AppModel;
