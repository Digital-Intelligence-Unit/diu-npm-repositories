const BaseModel = require("./base/postgres");
class PBIMetricLevel extends BaseModel {
    tableName = "pbi_metrics_level";

    getByMetricId(id, callback) {
        // Select all
        this.query(
            {
                text: `
                    SELECT *, array(
                        SELECT metric_period from ${this.tableName} pl
                        WHERE pl.metric_level_id = ${this.tableName}.metric_level_id 
                        GROUP BY pl.metric_period 
                        ORDER BY pl.metric_period DESC
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
