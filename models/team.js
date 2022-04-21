const BaseModel = require('./base/dynamo-db');
class TeamModel extends BaseModel {

    tableName = 'teams';

    getByFilters(filters, callback) {
        //Todo: Refactor
        if(filters.orgcode && filters.name) {
            const filter = "contains(#name, :name) and #organisationcode = :organisationcode";
            require("../dynamodb").All.getAllByFilterValues(this.AWS, this.tableName, filter, ["name", "organisationcode"], [filters.name, filters.orgcode], callback);
        } else if(filters.name) {
            const filter = "contains(#name, :name)";
            require("../dynamodb").All.getAllByFilterValue(this.AWS, this.tableName, filter, "name", filters.name, callback)
        } else {
            super.get(callback);
        }
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

        //Delete linked roles
        RoleLinkModel.deleteByLinkId('team', keys.code, (err, result) => {
            if (err) { callback("Error executing query", null); return; }

            //Delete linked capabilities
            CapabilityLinkModel.deleteByLinkId('team', keys.code, (err, result) => {
                if (err) { callback("Error executing query", null); return; }

                //Delete team
                super.delete(keys, callback);
            });
        });
    }
}

module.exports = TeamModel;