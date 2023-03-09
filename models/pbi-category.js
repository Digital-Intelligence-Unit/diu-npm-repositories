const BaseModel = require("./base/postgres");
class PBICategory extends BaseModel {
    tableName = "pbi_categories";

    getByFilters(filters = {}, callback) {
        // Create conditions
        const whereQuery = { conditions: [], values: [] };

        // Filter by name?
        if (filters.name) {
            whereQuery.conditions.push(`category_name ILIKE $1 OR category_id IN (
                SELECT category_id FROM pbi_metrics WHERE metric_name ILIKE $1
            )`);
            whereQuery.values = whereQuery.values.concat(["%" + filters.name + "%"]);
        }

        // Create query
        const whereQuerySql = whereQuery.conditions.length > 0 ? " WHERE " + whereQuery.conditions.join(" AND ") : "";

        // Run query
        this.query(
            {
                text: `
                    SELECT * FROM ${this.tableName} ${whereQuerySql} UNION 
                    SELECT * FROM ${this.tableName} where category_id IN (
                        SELECT category_parent_id FROM ${this.tableName} ${whereQuerySql}
                    )`,
                values: whereQuery.values,
            },
            (err, result) => {
                callback(err, result);
            }
        );
    }
}

module.exports = PBICategory;
