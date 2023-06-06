const BaseModel = require("./base/postgres");
class PBIGeography extends BaseModel {
    tableName = "pbi_geographies";

    getByFilters(filters = {}, callback) {
        // Create conditions
        const whereQuery = {
            conditions: [],
            values: [filters.page_limit || 200]
        };

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
                    LIMIT $1`,
                values: whereQuery.values,
            },
            (err, result) => {
                callback(err, result);
            }
        );
    }

    getByParent(parent, filters = {}, callback) {
        // Create conditions
        const whereQuery = {
            conditions: [
                "pbi_geographies_hierarchy.geo_parent = $1"
            ],
            values: [parent, filters.page_limit || 200]
        };

        // Add in filters
        ["level", "year"].forEach((filterName) => {
            if (filters[filterName]) {
                whereQuery.conditions.push(`pbi_geographies_hierarchy.geo_${filterName} = $${(whereQuery.values.length + 1)}`);
                whereQuery.values.push(filters[filterName]);
            }
        });

        // Create query
        const whereQuerySql = whereQuery.conditions.length > 0 ? " WHERE " + whereQuery.conditions.join(" AND ") : "";

        // Run query
        this.query(
            {
                text: `
                    SELECT pbi_geographies_hierarchy.*, ST_AsGeoJson(pbi_geographies.geom) as geom 
                    FROM pbi_geographies_hierarchy  
                    LEFT JOIN pbi_geographies 
ON pbi_geographies.geo_id = pbi_geographies_hierarchy.geo_id AND 
pbi_geographies.geo_year = pbi_geographies_hierarchy.geo_year ${whereQuerySql}
                    LIMIT $2`,
                values: whereQuery.values,
            },
            (err, result) => {
                callback(err, result);
            }
        );
    }
}

module.exports = PBIGeography;
