const BaseModel = require("./base/postgres");
class PBIMetric extends BaseModel {
    tableName = "pbi_metrics";
    primaryKey = "metric_id";

    getById(id, callback) {
        if (!(id instanceof Array)) {
            // Create single
            this.getByPrimaryKey(id, callback);
        } else {
            // Get by array
            this.query(
                {
                    text: `SELECT * FROM ${this.tableName} WHERE metric_id IN (${id.map((v, i) => "$" + (i + 1))})`,
                    values: id,
                },
                (err, result) => {
                    callback(err, result);
                }
            );
        }
    }

    getByFilters(filters = {}, callback) {
        // Create conditions
        const whereQuery = { conditions: [], values: [] };

        // Filter by name?
        if (filters.name) {
            whereQuery.conditions.push("metric_name ILIKE $1");
            whereQuery.values.push("%" + filters.name + "%");
        }

        // Filter by category?
        if (filters.category) {
            whereQuery.conditions.push(`
                (
                    category_id = $${(whereQuery.conditions.length + 1)} OR
                    category_id IN (
                        SELECT category_id FROM pbi_categories WHERE category_parent_id = $${(whereQuery.conditions.length + 2)}
                    )
                )
            `);
            whereQuery.values = whereQuery.values.concat([filters.category, filters.category]);
        }

        // Filter query
        this.query(
            {
                text: `
                    SELECT * FROM ${this.tableName}` + (
                    whereQuery.conditions.length > 0 ? " WHERE " + whereQuery.conditions.join(" AND ") : ""
                ),
                values: whereQuery.values,
            },
            (err, result) => {
                callback(err, result);
            }
        );
    }
}

module.exports = PBIMetric;
