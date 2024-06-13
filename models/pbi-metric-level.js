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

    getByMetricIds(ids, callback) {
        // Select all
        ids = ids.split(",");
        this.query(
            {
                text: `
                    SELECT STRING_AGG(metric_level_id, ',') as metric_level_id, metric_level, metric_period, geog_year
                    FROM pbi_metrics_level
                    WHERE metric_id IN (${ids.map((v, i) => "$" + (i + 1))})
                    GROUP BY metric_level, metric_period, geog_year
                    HAVING count(metric_level_id) = $${ids.length + 1}
                `,
                values: ids.concat([ids.length]),
            },
            (err, result) => {
                callback(err, result);
            }
        );
    }
}

module.exports = PBIMetricLevel;
