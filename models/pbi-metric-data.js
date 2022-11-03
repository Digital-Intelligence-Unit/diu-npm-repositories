const BaseModel = require("./base/postgres");
class PBIMetricData extends BaseModel {
    tableName = "pbi_metrics_data";

    getByMetricId(id, filters = { level: "ward" }, callback) {
        // Select all
        this.query(
            {
                text: `
                    SELECT ${this.tableName}.*, pbi_geographies.geo_name, ST_AsGeoJSON(pbi_geographies.geom) as geojson
                    FROM ${this.tableName} 
                    RIGHT JOIN pbi_geographies ON pbi_geographies.geo_id = ${this.tableName}.geo_id
                    WHERE ${this.tableName}.metric_level_id = (
                        SELECT metric_level_id from pbi_metrics_level 
                        WHERE metric_id = $1 AND metric_level = $2
                    );
                `,
                values: [id, filters.level],
            },
            (err, result) => {
                callback(err, result);
            }
        );
    }
}

module.exports = PBIMetricData;
