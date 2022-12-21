const BaseModel = require("./base/postgres");
class PBIView extends BaseModel {
    tableName = "pbi_views";

    getByUser(params, callback) {
        // Initialise query
        const query = {
            text: `SELECT * FROM ${this.tableName} WHERE "user#organisation" = $1`,
            values: [params["user#organisation"]]
        };

        // Filter by team?
        if (params.teamcodes) {
            query.text += ` OR teamcode IN (${params.teamcodes.map((v, i) => "$" + (i + 2))})`;
            query.values = query.values.concat(params.teamcodes);
        }

        // Run query
        this.query(query, callback);
    }
}

module.exports = PBIView;
