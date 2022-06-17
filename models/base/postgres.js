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
                    const errQueryResponse = "Error executing query";
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
            let query = `INSERT INTO ${this.tableName}(${Object.keys(attributes).join(", ")})`;
            query += " VALUES(" + [...Array(Object.values(attributes).length)].map((u, i) => "$" + (i + 1)) + ") RETURNING *";

            // Make query
            this.query({ text: query, values: Object.values(attributes) }, callback);
        } else {
            // Create list of keys and values
            const keys = [...new Set(attributes.flatMap((x) => Object.keys(x)))];
            const values = [];

            // Create query
            let query = `INSERT INTO ${this.tableName}(${keys.join(", ")})  VALUES `;

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
            query += column + " = $" + index + ", ";
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
}

module.exports = BasePostgresModel;
