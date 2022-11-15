const BaseModel = require("./base/postgres");
class PBIMetricLevel extends BaseModel {
    tableName = "pbi_metrics_level";

    getByMetricId(id, callback) {
        // Select all
        this.query(
            {
                text: `
                    SELECT *, array(
                        SELECT metric_period from pbi_metrics_data
                        WHERE pbi_metrics_data.metric_level_id = ${this.tableName}.metric_level_id 
                        GROUP BY pbi_metrics_data.metric_period 
                        ORDER BY pbi_metrics_data.metric_period DESC
                    ) AS periods FROM ${this.tableName} WHERE metric_id = $1                  
                `,
                values: [id],
            },
            (err, result) => {
                callback(err, result);
            }
        );
    }
}

module.exports = PBIMetricLevel;
