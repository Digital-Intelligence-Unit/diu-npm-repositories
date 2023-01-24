const BaseModel = require("./base/postgres");
class CVICohortModel extends BaseModel {
    tableName = "cvi_cohorts";

    create(attributes, callback) {
        super.create(attributes, callback);
    }

    getById(id, callback) {
        const query = `SELECT * FROM ${this.tableName} WHERE id = ${id}`;
        this.query(query, callback);
    }

    get(params, callback) {
        // Initialise query
        let query = `SELECT * FROM ${this.tableName}`;
        let blnOr = false;
        // Filter by cohort name
        if (params.name || params.username || params.teamcode) {
            query += ` WHERE `;
        }

        // Filter by username
        if (params.username) {
            query += ` username = '${params.username}' `;
            blnOr = true;
        }

        // Filter by teamcode
        if (params.teamcode) {
            if (blnOr) {
                query += ` OR `;
            }
            if (params.teamcode.includes(",")) {
                const teamcodes = params.teamcode.split(",").join("','");
                query += ` teamcode IN ('${teamcodes}') `;
            } else {
                query += ` teamcode = '${params.teamcode}'`;
            }
        }
        // Run query
        this.query(query, callback);
    }
}

module.exports = CVICohortModel;
