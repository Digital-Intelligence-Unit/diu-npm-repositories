// @ts-check

function init(config) {
  const pg = require("pg");
  const types = pg.types;
  const Pool = pg.Pool;
  const pool = new Pool({
    user: config.postgres_un,
    host: config.pgdatabase,
    database: "postgres",
    password: config.postgres_pw,
    // @ts-ignore
    port: config.pgport,
  });
  // @ts-ignore
  types.setTypeParser(types.builtins.DATE, (stringValue) => {
    return new Date(stringValue);
  });
  return pool;
}

function getAll(pool, tablename, callback) {
  const query = `SELECT * FROM ` + tablename;
  pool.query(query, (error, results) => {
    if (error) {
      callback("Error: " + error, null);
    } else if (results.rows) {
      callback(null, results.rows);
    } else {
      callback(null, []);
    }
  });
}

function getGeoJson(pool, params, callback) {
  const whereclause = params.whereclause || "";
  const pcgeoquery =
    `SELECT 'FeatureCollection' AS TYPE,
    array_to_json(array_agg(f)) AS features
FROM (
    SELECT
        'Feature' AS TYPE,
        ST_AsGeoJSON (` +
    params.st_asgeojson +
    `, 4)::json AS geometry,
        ` +
    params.as_properties +
    `
    FROM ` +
    params.tablename +
    ` AS lg ` +
    whereclause +
    ` ) as f`;
  pool.query(pcgeoquery, (error, results) => {
    if (error) {
      callback("Error: " + error, null);
    }
    callback(null, results.rows);
  });
}

function getIsoChrone(pool, params, callback) {
  const geoquery =
    `WITH data AS (SELECT '` +
    params.query +
    `'::json AS fc),
      geoJsonFrangment AS (
      	SELECT
          ST_GeomFromGeoJSON(feat->>'geometry') AS geom
      	FROM (
      	  SELECT json_array_elements(fc->'features') AS feat
      	  FROM data
      	) AS f
      	LIMIT 1
      )
    SELECT
      mosaicgroup,
      mosaictype,
      COUNT(*) AS households
    FROM
      public.mosaichousehold p
    WHERE
      ST_Contains(
      		ST_GeometryN(
      			ST_Force2D(
      				ST_SetSRID(
      					(SELECT geom FROM geoJsonFrangment),
      				4326)
      			),
      		1),
        p.geom
      )
    GROUP BY
      mosaictype,
      mosaicgroup;`;
  pool.query(geoquery, (err, result) => {
    if (err) {
      callback(err, null);
    } else {
      if (result.rows) {
        callback(null, JSON.stringify(result.rows));
      } else {
        callback(null, "[]");
      }
    }
  });
}

function getByQuery(pool, getByQuery, callback) {
  pool.query(getByQuery, (error, results) => {
    if (error) {
      callback("Error: " + error, null);
    } else if (results.rows) {
      callback(null, results.rows);
    } else {
      callback(null, []);
    }
  });
}

module.exports.All = {
  init: init,
  getByQuery: getByQuery,
  getAll: getAll,
  getGeoJson: getGeoJson,
  getIsoChrone: getIsoChrone,
};
