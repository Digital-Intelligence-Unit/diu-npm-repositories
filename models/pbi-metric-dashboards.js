const BaseModel = require("./base/postgres");
class PBIMetricDashboard extends BaseModel {
    getDashboard(metrics, filters = {}, callback) {
        // Run query
        this.query({
            text: `
                WITH pbi_data AS (
                    SELECT 
                        pbi_metrics_level.metric_id,
                        pbi_metrics_level.metric_level_id,
                        pbi_metrics_level.geog_year,
                        pbi_metrics_data.metric_data_value_float AS metric_data_value_float, 
                        pbi_metrics_data.metric_data_value_float_lcl AS metric_data_value_float_lcl, 
                        pbi_metrics_data.metric_data_value_float_ucl AS metric_data_value_float_ucl
                    FROM pbi_metrics_level
                    LEFT JOIN pbi_metrics_data ON pbi_metrics_level.metric_level_id = pbi_metrics_data.metric_level_id
                    WHERE pbi_metrics_data.geo_id = $1
                    AND pbi_metrics_level.metric_id IN (${metrics.map((v, i) => "$" + (i + 2)).join(",")})
                    ORDER BY pbi_metrics_level.metric_period DESC
                  )
                  SELECT * FROM pbi_metrics RIGHT JOIN pbi_data ON pbi_data.metric_id = pbi_metrics.metric_id;`,
            values: [filters.geo_id].concat(metrics)
        }, (err, result) => {
            callback(err, result);
        });
    }
}

module.exports = PBIMetricDashboard;
