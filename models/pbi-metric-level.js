const BaseModel = require("./base/postgres");
class PBIMetricLevel extends BaseModel {
    tableName = "pbi_metrics_level";

    getByMetricId(id, callback) {
        // Select all
        this.query(
            {
                text: `SELECT * FROM ${this.tableName} WHERE metric_id = $1 ORDER BY metric_level ASC`,
                values: [id],
            },
            (err, result) => {
                callback(err, result);
            }
        );
    }
}

module.exports = PBIMetricLevel;
