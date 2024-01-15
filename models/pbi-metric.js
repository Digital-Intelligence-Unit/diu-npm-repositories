const PermissionsHelper = require("../helpers/permissions");
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

    get(user, callback) {
        // Select all
        const rbacQuery = PermissionsHelper.pbiCapabilitiesAsWhereQuery("pbi_data", "capability", user);
        this.query({
            text: `SELECT * FROM ${this.tableName} WHERE ${rbacQuery.text}`,
            values: rbacQuery.values
        }, callback);
    }

    getByFilters(filters = {}, user, callback) {
        // Create conditions
        filters.page_limit = filters.page_limit || 25;
        const rbacQuery = PermissionsHelper.pbiCapabilitiesAsWhereQuery("pbi_data", "capability", user, 3);
        const whereQuery = {
            conditions: [rbacQuery.text],
            values: [
                filters.page_limit,
                (filters.page - 1 || 0) * filters.page_limit
            ].concat(rbacQuery.values)
        };

        // Filter by name?
        if (filters.name) {
            whereQuery.conditions.push(`metric_name ILIKE $${(whereQuery.values.length + 1)}`);
            whereQuery.values.push("%" + filters.name + "%");
        }

        // Filter by category?
        if (filters.category) {
            whereQuery.conditions.push(`
                (
                    category_id = $${(whereQuery.values.length + 1)} OR
                    category_id IN (
                        SELECT category_id FROM pbi_categories WHERE category_parent_id = $${(whereQuery.values.length + 1)}
                    )
                )
            `);
            whereQuery.values = whereQuery.values.concat([filters.category]);
        }

        // Filter by geo_type?
        if (filters.geo_type) {
            whereQuery.conditions.push(`metric_geo_type = $${(whereQuery.values.length + 1)}`);
            whereQuery.values.push(filters.geo_type);
        }

        // Filter by id_prefix?
        if (filters.id_prefix) {
            whereQuery.conditions.push(`metric_id LIKE $${(whereQuery.values.length + 1)}`);
            whereQuery.values.push(filters.id_prefix + "%");
        }

        // Filter query
        this.query(
            {
                text: `SELECT * FROM ${this.tableName}` + (
                    whereQuery.conditions.length > 0 ? " WHERE " + whereQuery.conditions.join(" AND ") : ""
                ) + ` ORDER BY length(metric_name), metric_name LIMIT $1 OFFSET $2`,
                values: whereQuery.values,
            },
            (err, result) => {
                callback(err, result);
            }
        );
    }
}

module.exports = PBIMetric;
