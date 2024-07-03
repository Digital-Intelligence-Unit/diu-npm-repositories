/* eslint-disable max-len */
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
                    WHERE metric_level_id = $1 AND metric_data_value_float IS NOT NULL
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
                    WHERE metric_level_id = $1 AND metric_data_value_float IS NOT NULL
                ) AS x 
                WHERE x.quartile = 4 
                GROUP BY x.quartile 
                ORDER BY x.quartile
            ) k`,
            values: [id]
        }, (err, result) => {
            console.log(result);
            callback(err, result);
        });
    }

    getByMetricLevelId(id, filters = {}, callback) {
        // Make query and return
        this.query(
            this._createMetricLevelIdQuery(id, filters),
            (err, result) => {
                callback(err, result);
            }
        );
    }

    getIndexAvgByMetricLevelIds(ids, filters = {}, callback) {
        // Split ids
        ids = ids.split(",");
        const values = (filters.weights ? Object.values(filters.weights) : []).concat(ids, [
            ids.reduce((total, id) => {
                return total + (parseFloat(filters.weights[id]) || 1);
            }, 0),
            ids.length
        ]);

        // Create query
        this.query({
            text:
                `WITH 
                pbi_metrics_level_data AS (
                    SELECT *, 
                    pbi_metrics_level.metric_level_id AS metric_level_ids,
                    CASE
                        ${
    Object.keys(filters.weights || {}).map((metricId, index) => {
        const metricPolarity = filters.polarities ? filters.polarities[metricId] : 1;
        return `WHEN pbi_metrics_level.metric_id = '${metricId}' THEN $${index + 1} * ${metricPolarity}`;
    }).join(" ")
}
                    ELSE
                       1
                    END AS weight
                    FROM pbi_metrics_level
                    LEFT JOIN pbi_metrics_data ON pbi_metrics_level.metric_level_id = pbi_metrics_data.metric_level_id
                    WHERE pbi_metrics_level.metric_level_id IN (${ids.map((v, i) => "$" + (Object.values(filters.weights).length + i + 1))}) 
                    -- AND metric_data_value_float_idx IS NOT NULL
                ),
                
                pbi_metrics_level_data_weighted AS (
                    SELECT 
                    pbi_metrics_level_data.geo_id,
                    pbi_metrics_level_data.geog_year,
                    (SUM(pbi_metrics_level_data.metric_data_value_float_idx * pbi_metrics_level_data.weight) / $${values.length - 1}) as metric_data_value_float,
                    ARRAY_AGG(pbi_metrics_level_data.metric_data_value_float ORDER BY metric_data_value_float DESC) as metric_data_value_floats,
                    ARRAY_AGG(pbi_metrics_level_data.metric_level_ids ORDER BY metric_data_value_float DESC) as metric_level_ids,
                    ARRAY_AGG(pbi_metrics_level_data.metric_id ORDER BY metric_data_value_float DESC) as metric_ids
                    FROM pbi_metrics_level_data
                    GROUP BY pbi_metrics_level_data.geo_id, pbi_metrics_level_data.geog_year
                    HAVING count(pbi_metrics_level_data.geo_id) = $${values.length} -- For limited area data
                )

                SELECT 
                pbi_metrics_level_data_weighted.geo_id, 
                pbi_metrics_level_data_weighted.metric_data_value_float, 
                pbi_metrics_level_data_weighted.metric_data_value_floats, 
                pbi_metrics_level_data_weighted.metric_level_ids, 
                pbi_metrics_level_data_weighted.metric_ids, 
                pbi_geographies.geo_name, 
                pbi_geographies.geo_year,
                ST_AsGeoJSON(ST_Simplify(pbi_geographies.geom, 0.000075, TRUE)) as geojson
                FROM pbi_metrics_level_data_weighted
                LEFT JOIN pbi_geographies ON pbi_geographies.geo_id = pbi_metrics_level_data_weighted.geo_id
                WHERE pbi_geographies.geo_year IS NOT DISTINCT FROM pbi_metrics_level_data_weighted.geog_year`,
            values
        },
        (err, result) => {
            callback(err, result);
        });
    }

    getMaxValuesByMetricLevelIds(ids, filters = {}, callback) {
        this.query({
            text:
                `WITH 
                pbi_metrics_level_data AS (
                    SELECT *
                    FROM pbi_metrics_level
                    LEFT JOIN pbi_metrics_data ON pbi_metrics_level.metric_level_id = pbi_metrics_data.metric_level_id
                    WHERE pbi_metrics_level.metric_level_id IN (${ids.split(",").map((v, i) => "$" + (i + 1))})
                ),
                
                pbi_metrics_level_data_weighted AS (
                    SELECT 
                    pbi_metrics_level_data.geo_id,
                    pbi_metrics_level_data.geog_year,
                    ARRAY_AGG(metric_data_value_float ORDER BY metric_data_value_float DESC) as metric_data_value_floats,
                    ARRAY_AGG(metric_id ORDER BY metric_data_value_float DESC) as metric_ids
                    FROM pbi_metrics_level_data
                    GROUP BY pbi_metrics_level_data.geo_id, pbi_metrics_level_data.geog_year
                )

                SELECT 
                pbi_metrics_level_data_weighted.geo_id, 
                (pbi_metrics_level_data_weighted.metric_ids)[1] AS metric_data_value_char, 
                pbi_metrics_level_data_weighted.metric_data_value_floats, 
                pbi_metrics_level_data_weighted.metric_ids, 
                pbi_geographies.geo_name, 
                pbi_geographies.geo_year,
                ST_AsGeoJSON(ST_Simplify(pbi_geographies.geom, 0.000075, TRUE)) as geojson
                FROM pbi_metrics_level_data_weighted
                LEFT JOIN pbi_geographies ON pbi_geographies.geo_id = pbi_metrics_level_data_weighted.geo_id
                WHERE pbi_geographies.geo_year IS NOT DISTINCT FROM pbi_metrics_level_data_weighted.geog_year`,
            values: ids.split(",")
        },
        (err, result) => {
            callback(err, result);
        });
    }

    getAddressesByMetricLevelId(id, filters = {}, callback) {
        // Get query
        const query = this._createMetricLevelIdQuery(id, filters, [
            "ST_Union(pbi_geographies.geom)"
        ]);

        // Get addresses (Note: Should only be performed on polygon levels)
        query.text = `
        SELECT pbi_geographies.geo_id as uprn, pbi_geographies.geo_name as address
        FROM pbi_geographies 
        WHERE ST_WITHIN(geom, (${query.text})) AND geo_level = 'Property'`;

        // Make query and return
        this.query(query, (err, result) => {
            callback(err, result);
        });
    }

    _createMetricLevelIdQuery(id, filters, columns = [
        "pbi_metrics_level_data.*",
        "pbi_geographies.geo_name",
        "pbi_geographies.geo_year",
        "ST_AsGeoJSON(ST_Simplify(pbi_geographies.geom, 0.000075, TRUE)) as geojson"
    ]) {
        // Use different geom?
        if (filters.level && filters.level.includes("Custom")) {
            columns[3] = "ST_AsGeoJSON(pbi_metrics_level_data.metric_data_geom) as geojson";
        }

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
            WHERE pbi_geographies.geo_year IS NOT DISTINCT FROM pbi_metrics_level_data.geog_year`,
            values: [id],
        };

        // Dynamic filter?
        if (filters.value_operator && filters.value) {
            // Note: Make sure to validate operator first
            if (filters.value_operator === "BETWEEN") {
                query.text += ` AND (metric_data_value_float BETWEEN $${query.values.length + 1} AND $${query.values.length + 2})`;
            } else if (filters.value_operator === "LIKE") {
                query.text += ` AND (metric_data_value_char ILIKE $${query.values.length + 1}`;
            } else {
                query.text += ` AND (metric_data_value_char IN ($${query.values.length + 1})`;
            }
            query.values = query.values.concat(filters.value.split(","));
        }

        return query;
    }
}

module.exports = PBIMetricData;
