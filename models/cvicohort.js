const BaseModel = require("./base/postgres");
class CVICohortModel extends BaseModel {
    tableName = "cvi_cohorts";

    create(attributes, callback) {
        super.create(attributes, callback);
    }

    getById(id, callback) {
        let ids = id;
        if (Array.isArray(id)) {
            ids = id.join(",");
        }
        const query = `SELECT * FROM ${this.tableName} WHERE id IN (${ids})`;
        this.query(query, callback);
    }

    get(params, callback) {
        // Initialise query
        let query = `SELECT * FROM ${this.tableName}`;
        // Filter by cohort name
        if (params.name || params.username || params.teamcode) {
            query += ` WHERE `;
        }

        Object.keys(params).forEach((param, index) => {
            if (index) {
                query += ` OR `;
            }
            if (params[param].includes(",")) {
                const values = params[param].split(",").join("','");
                query += ` ${param} IN ('${values}') `;
            } else {
                query += ` ${param} = '${params[param]}'`;
            }
        });

        // Run query
        this.query(query, callback);
    }
}

module.exports = CVICohortModel;
