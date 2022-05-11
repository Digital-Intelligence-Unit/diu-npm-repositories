const BaseModel = require("./base/dynamo-db");
const uuid = require("uuid");
class DashboardsModel extends BaseModel {
    tableName = "apps";
    removeDashboard = function (name, env, callback) {
        const key = {
            name: name,
            environment: env,
        };
        this.delete(key, callback);
    };

    getDashboardByName = function (name, callback) {
        this.getByKeys({ name: name }, callback);
    };

    getDashboardByOwner = function (owner, callback) {
        this.getByKeys({ ownerName: owner }, callback);
    };

    getDashboardByEnvironment = function (environment, callback) {
        this.getByKeys({ environment: environment }, callback);
    };

    getDashboardByStatus = function (status, callback) {
        this.getByKeys({ status: status }, callback);
    };

    getAll = function (callback) {
        this.get(callback);
    };

    addDashboard = function (newDashboard, callback) {
        this.create(newDashboard, callback);
    };

    updateDashboard = function (updatedItem, callback) {
        this.update(["name", "environment"], updatedItem, callback);
    };
}

module.exports = DashboardsModel;
