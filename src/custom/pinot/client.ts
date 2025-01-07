// @ts-nocheck
import util from 'node:util';
import { default as axios } from 'axios';
import MySqlClient from 'knex/lib/dialects/mysql/index.js';
import { SqlFormat } from './sql.js';

export class PinotClient extends MySqlClient {

    constructor(config: Knex.Config) {
        config.client = 'mysql';
        super(config);
    }

    _driver(): any {
        // Setup dataApiClient
        return axios.create({
            baseURL: `${this.config.connection.broker}`,
        });
    }

    async acquireConnection() {
        return this._driver(this.connectionSettings);
    }

    async _query(connection, obj) {
        if (!obj || typeof obj === 'string') obj = { sql: obj };

        // Run sql
        const result = await connection.post('/sql', {
            sql: SqlFormat.format(obj.sql.replaceAll('`', ''), obj.bindings),
            queryOptions: "timeoutMs=100000;useMultistageEngine=true"
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Handle errors
        if (!result.data || result.status !== 200) {
            // Pinot exception
            if (result.data.exceptions.length > 0) {
                throw new Error(result.data.exceptions[0].message);
            }

            throw new Error('Pinot query failed for unknown reason! Check connection...')
        }

        // Handle no data
        if (result.data.numRowsResultSet == 0) {
            obj.response = [[], []];
        }

        // Return data
        const tableData = result.data.resultTable;
        obj.response = [
            tableData.rows.map((row) => {
                return row.reduce((values, value, index) => {
                    values[tableData.dataSchema.columnNames[index]] = value;
                    return values;
                }, {});
            }),
            tableData.dataSchema.columnNames
        ];

        return obj;
    }
}