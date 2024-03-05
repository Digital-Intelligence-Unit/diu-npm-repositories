const BaseModel = require("./base/postgres");
class PBIMetricData extends BaseModel {
    tableName = "pbi_metrics_data";

    getSpineDataByMetricLevelId(id, callback) {
        this.query({
            text: `
            SELECT * FROM (
                SELECT x.quartile,MIN(x.metric_data_value_float) metric_data_value_float, COUNT(*) 
                FROM (
                    SELECT ntile(4) OVER (ORDER BY metric_data_value_float) AS quartile, metric_data_value_float 
                    FROM pbi_metrics_data 
                    WHERE metric_level_id = $1
                ) AS x --WHERE x.quartile <= 3
                GROUP BY x.quartile 
                ORDER BY x.quartile
            ) j 
            
            UNION ALL 
          
            SELECT * FROM (
                SELECT 5 as quartile, MAX(x.metric_data_value_float) metric_data_value_float, COUNT(*) 
                FROM (
                    SELECT ntile(4) OVER (ORDER BY metric_data_value_float) AS quartile, metric_data_value_float 
                    FROM pbi_metrics_data 
                    WHERE metric_level_id = $1
                ) AS x 
                WHERE x.quartile = 4 
                GROUP BY x.quartile 
                ORDER BY x.quartile
            ) k`,
            values: [id]
        }, (err, result) => {
            callback(err, result);
        });
    }

    createMetricLevelIdQuery(id, filters, columns = [
        "pbi_metrics_level_data.*",
        "pbi_geographies.geo_name",
        "pbi_geographies.geo_year",
        "ST_AsGeoJSON(ST_Simplify(pbi_geographies.geom, 0.000075, TRUE)) as geojson"
    ]) {
        // Select all
        const query = {
            text: `
            WITH pbi_metrics_level_data AS (
                SELECT *
                FROM pbi_metrics_level
                LEFT JOIN pbi_metrics_data ON pbi_metrics_level.metric_level_id = pbi_metrics_data.metric_level_id
                WHERE pbi_metrics_level.metric_level_id = $1
            )
            SELECT ${columns.join(", ")}
            FROM pbi_metrics_level_data
            LEFT JOIN pbi_geographies ON pbi_geographies.geo_id = pbi_metrics_level_data.geo_id
            WHERE pbi_geographies.geom IS NOT NULL AND pbi_geographies.geo_year IS NOT DISTINCT FROM pbi_metrics_level_data.geog_year`,
            values: [id],
        };

        // Dynamic filter?
        if (filters.value_operator && filters.value) {
            // Note: Make sure to validate operator first
            if (filters.value_operator === "BETWEEN") {
                query.text += ` AND (metric_data_value_float BETWEEN $${query.values.length + 1} AND $${query.values.length + 2})`;
            } else {
                query.text += ` AND (metric_data_value_char IN ($${query.values.length + 1})`;
            }
            query.values = query.values.concat(filters.value.split(","));
        }

        return query;
    }

    getByMetricLevelId(id, filters = {}, callback) {
        // Make query and return
        this.query(
            this.createMetricLevelIdQuery(id, filters),
            (err, result) => {
                callback(err, result);
            }
        );
    }

    getAddressesByMetricLevelId(id, filters = {}, callback) {
        // Get query
        const query = this.createMetricLevelIdQuery(id, filters, [
            "ST_Union(pbi_geographies.geom)"
        ]);

        // Get addresses
        query.text = `
        SELECT pbi_geographies.geo_id as uprn, pbi_geographies.geo_name as address
        FROM pbi_geographies 
        WHERE ST_WITHIN(geom, (${query.text})) AND geo_level = 'Property'`;

        // Make query and return
        this.query(query, (err, result) => {
            callback(err, result);
        });
    }
}

module.exports = PBIMetricData;
