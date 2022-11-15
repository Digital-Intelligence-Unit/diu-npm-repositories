const BaseModel = require("./base/postgres");
class PBIMetricData extends BaseModel {
    tableName = "pbi_metrics_data";

    getByMetricId(id, filters = { level: "ward" }, callback) {
        // Select all
        const query = {
            text: `
                SELECT ${this.tableName}.*, pbi_geographies.geo_name, ST_AsGeoJSON(pbi_geographies.geom) as geojson
                FROM ${this.tableName} 
                RIGHT JOIN pbi_geographies ON pbi_geographies.geo_id = ${this.tableName}.geo_id
                WHERE ${this.tableName}.metric_level_id = (
                    SELECT metric_level_id from pbi_metrics_level 
                    WHERE metric_id = $1 AND metric_level = $2
                ) AND metric_period = $3`,
            values: [id, filters.level, filters.period],
        };

        // Dynamic filter?
        if (filters.value_operator && filters.value) {
            // Note: Make sure to validate operator first
            query.text += ` AND (
                metric_data_value_float ${filters.value_operator} $4 OR 
                metric_data_value_float ${filters.value_operator} $4
            )`;
            query.values.push(filters.value);
        }

        // Make query and return
        this.query(query, (err, result) => {
            callback(err, result);
        });
    }
}

module.exports = PBIMetricData;
