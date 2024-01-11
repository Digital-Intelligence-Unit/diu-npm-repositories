const BaseModel = require("./base/postgres");
class PBIUploader extends BaseModel {
    tableName = "pbi_uploaders";
    primaryKey = "id";

    getByOwner(owner, callback) {
        this.query(
            {
                text: `SELECT * FROM ${this.tableName} WHERE owner_id = $1`,
                values: [owner],
            },
            (err, result) => {
                callback(err, result);
            }
        );
    }

    deleteMetric(owner, metricId, callback) {
        (async () => {
            await new Promise((resolve, reject) => {
                // Delete metric data
                this.query(
                    {
                        text: `
                            DELETE FROM pbi_metrics_data WHERE metric_level_id IN (
                                SELECT metric_level_id FROM pbi_metrics_level WHERE metric_id = $1
                            );`,
                        values: [metricId],
                    },
                    (err, result) => {
                        // Check for error
                        if (err) { reject(err); }

                        // Re-map
                        resolve(true);
                    }
                );

                // Delete metric levels
                this.query(
                    {
                        text: "DELETE FROM pbi_metrics_level WHERE metric_id = $1;",
                        values: [metricId],
                    },
                    (err, result) => {
                        // Check for error
                        if (err) { reject(err); }

                        // Re-map
                        resolve(true);
                    }
                );

                // Delete metric
                this.query(
                    {
                        text: "DELETE FROM pbi_metrics WHERE metric_id = $1;",
                        values: [metricId],
                    },
                    (err, result) => {
                        // Check for error
                        if (err) { reject(err); }

                        // Re-map
                        resolve(true);
                    }
                );

                // TO-DO: Add delete categories query
            });
        })().then((data) => {
            callback(null, data);
        }).catch((error) => {
            console.log(error);
            callback(error, null);
        });
    }
}

module.exports = PBIUploader;
