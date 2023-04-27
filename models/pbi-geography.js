const BaseModel = require("./base/postgres");
class PBIGeography extends BaseModel {
    tableName = "pbi_geographies";

    getByFilters(filters = {}, callback) {
        // Create conditions
        const whereQuery = { conditions: [], values: [] };

        // Add in filters
        ["id", "level", "year"].forEach((filterName) => {
            if (filters[filterName]) {
                whereQuery.conditions.push(`geo_${filterName} = $${(whereQuery.values.length + 1)}`);
                whereQuery.values.push(filters[filterName]);
            }
        });

        // Add in name
        if (filters["name"]) {
            whereQuery.conditions.push(`geo_name ILIKE $${(whereQuery.values.length + 1)}`);
            whereQuery.values.push("%" + filters["name"] + "%");
        }

        // Create query
        const whereQuerySql = whereQuery.conditions.length > 0 ? " WHERE " + whereQuery.conditions.join(" AND ") : "";

        // Run query
        this.query(
            {
                text: `
                    SELECT geo_id, geo_name, geo_level, geo_year, ST_AsGeoJson(geom) as geom 
                    FROM ${this.tableName} ${whereQuerySql} 
                    LIMIT 200`,
                values: whereQuery.values,
            },
            (err, result) => {
                callback(err, result);
            }
        );
    }
}

module.exports = PBIGeography;
