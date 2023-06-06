const PostgresHelper = require("../../helpers/postgres");
class BasePostgresModel {
    pool; // Pg Pool
    tableName = "table_name";
    primaryKey = "id";

    constructor(pool = null) {
        this.pool = pool || require("../../config/database").connections.postgres;
    }

    query(query, callback) {
        // Connect to client
        this.pool.connect((err, client, release) => {
            // Error?
            if (err) {
                const errReponse = "Error acquiring client";
                console.error(errReponse, err.stack);
                callback(errReponse, null);
                return;
            }

            // Make query
            client.query(query, (errQuery, result) => {
                // Release connection
                release();

                // Return errors?
                if (errQuery) {
                    const errQueryResponse =
                        {
                            23505: "Item already exists",
                        }[errQuery.code] || "Error executing query";
                    console.error(errQueryResponse, errQuery.stack);
                    callback(errQueryResponse, null);
                    return;
                }
                // Return rows
                callback(null, result.rows || null);
            });
        });
    }

    queryWithParams(query, params, callback) {
        // Connect to client
        this.pool.connect((err, client, release) => {
            // Error?
            if (err) {
                const errReponse = "Error acquiring client";
                console.error(errReponse, err.stack);
                callback(errReponse, null);
                return;
            }

            if (typeof query === "string") {
                query = this._addParams(query, params);
            } else {
                query.text = this._addParams(query.text, params);
            }

            // Make query
            client.query(query, (errQuery, result) => {
                // Release connection
                release();

                // Return errors?
                if (errQuery) {
                    const errQueryResponse =
                        {
                            23505: "Item already exists",
                        }[errQuery.code] || "Error executing query";
                    console.error(errQueryResponse, errQuery.stack);
                    callback(errQueryResponse, null);
                    return;
                }

                // Return rows
                callback(null, result.rows || null);
            });
        });
    }

    create(attributes, callback) {
        // Is array?
        if (!(attributes instanceof Array)) {
            // Change attributes?
            attributes = PostgresHelper.marshallAttributes(attributes);

            // Build query
            let query = `INSERT INTO ${this.tableName}(${Object.keys(attributes)
                .map((key) => "\"" + key + "\"")
                .join(", ")})`;
            query += " VALUES(" + [...Array(Object.values(attributes).length)].map((u, i) => "$" + (i + 1)) + ") RETURNING *";
            // Make query
            this.query({ text: query, values: Object.values(attributes) }, callback);
        } else {
            // Create list of keys and values
            const keys = [...new Set(attributes.flatMap((x) => Object.keys(x)))];
            const values = [];

            // Create query
            let query = `INSERT INTO ${this.tableName}(${keys.map((key) => "\"" + key + "\"").join(", ")})  VALUES `;

            // Loop through items
            attributes.forEach((item) => {
                // Change attributes?
                item = PostgresHelper.marshallAttributes(item);

                // Add attributes to query
                query += "(" + [...Array(keys.length)].map((u, i) => "$" + (values.length + i + 1)) + "), ";

                // Add each attribute to values
                keys.forEach((key) => {
                    values.push(item[key] || null);
                });
            });
            // Remove trailing comma
            query = query.slice(0, -2) + " RETURNING *";
            // Make query
            this.query({ text: query, values }, callback);
        }
    }

    get(callback) {
        // Select all
        this.query(`SELECT * FROM ${this.tableName}`, callback);
    }

    getByPrimaryKey(primaryKeyValue, callback) {
        // Select all
        const query = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`;
        this.query({ text: query, values: [primaryKeyValue] }, (err, result) => {
            callback(err, result ? result[0] : null);
        });
    }

    updateByPrimaryKey(primaryKeyValue, attributes, callback) {
        // Change attributes?
        attributes = PostgresHelper.marshallAttributes(attributes);
        // Build query
        let query = `UPDATE ${this.tableName} SET `;

        let index = 1;
        for (const column in attributes) {
            query += "\"" + column + "\" = $" + index + ", ";
            index++;
        }
        query = query.slice(0, -2) + ` WHERE ${this.primaryKey} = '${primaryKeyValue}' RETURNING *`;

        // Make update
        this.query({ text: query, values: Object.values(attributes) }, callback);
    }

    deleteByPrimaryKey(primaryKeyValue, callback) {
        // Build query
        const query = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = '${primaryKeyValue}' RETURNING *`;

        // Make update
        this.query(query, (err, result) => {
            callback(err, result[0] || null);
        });
    }

    delete(keys, callback) {}

    _addParams(query, params) {
        // Add count
        if (params.count) {
            const arrQuery = query.split("FROM");
            query = "SELECT count(*) FROM " + arrQuery[1];
            return query;
        }

        // Add group by
        if (params.groupBy) {
            query += " GROUP BY " + params.groupBy;
        }

        // Add order by
        if (params.orderBy) {
            query += " ORDER BY " + params.orderBy;
        }
        if (params.orderBy && params.orderByDirection) {
            switch (params.orderByDirection.toUpperCase()) {
                case "ASC":
                case "DESC":
                    query += " " + params.orderByDirection.toUpperCase();
                    break;
                default:
                    // do nothing
                    break;
            }
        }

        // Add offset
        if (params.offset) {
            query += " OFFSET " + params.offset;
        }

        // Add limit
        if (params.limit) {
            query += " LIMIT " + params.limit;
        }

        return query;
    }
}

module.exports = BasePostgresModel;
