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

    getByMetricIds(ids, filters, callback) {
        // Set grouping
        const groupingMethod = filters.grouping_method || 'metric_period';
        
        // Select all
        ids = ids.split(",");
        this.query(
            {
                text: {
                    metric_period: `
                        SELECT STRING_AGG(metric_level_id, ',') as metric_level_id, metric_level, metric_period, geog_year
                        FROM pbi_metrics_level
                        WHERE metric_id IN (${ids.map((v, i) => "$" + (i + 1))})
                        GROUP BY metric_level, geog_year, metric_period
                        HAVING count(metric_level_id) = $${ids.length + 1}
                    `,
                    metric_id: `
                        SELECT 
                            metric_level_id, metric_period, metric_id, metric_level, geog_year
                        FROM pbi_metrics_level
                        WHERE metric_id IN (${ids.map((v, i) => "$" + (i + 1))}) AND metric_level IN (
                            SELECT metric_level FROM pbi_metrics_level
                            WHERE metric_id IN (${ids.map((v, i) => "$" + (i + 1))})
                            GROUP BY metric_level, geog_year
                            HAVING count(DISTINCT metric_id) = $${ids.length + 1}
                        )
                    `
                }[groupingMethod],
                values: ids.concat([ids.length])
            },
            (err, result) => {
                callback(err, result);
            }
        );
    }
}

module.exports = PBIMetricLevel;
