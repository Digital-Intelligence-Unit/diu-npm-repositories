const BaseModel = require("./base/postgres");
class TrustsAndSitesModel extends BaseModel {
    tableName = "trusts_and_sites";

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
        const values = [];
        let counter = 1;
        const replacementPrefix = "$";
        let replacementNumber = "";
        Object.keys(params).forEach((param, index) => {
            if (params[param].includes(",")) {
                const replacements = params[param].split(",").map(value => {
                    values.push(value);
                    replacementNumber = replacementPrefix + counter;
                    counter++;
                    return replacementNumber;
                }).join(",");
                query += ` ${index ? "OR" : "WHERE ("} ${param} IN (${replacements}) `;
            } else {
                values.push(params[param]);
                replacementNumber = replacementPrefix + counter;
                counter++;
                query += ` ${index ? "OR" : "WHERE ("} ${param} = ${replacementNumber}`;
            }
        });
        query += `)`;
        const objQuery = {
            text: query,
            values,
        };
        // Run query
        this.query(objQuery, callback);
    }
}

module.exports = TrustsAndSitesModel;
