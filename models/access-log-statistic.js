const BaseModel = require("./base/postgres");
class AccessLogStatistic extends BaseModel {
    tableName = "access_log_statistics";

    updateOrCreate(attributes, callback) {
        // Create query
        let query = `INSERT INTO ${this.tableName} (type, date, total) VALUES `;

        // Array?
        if (!(attributes instanceof Array)) {
            query += "($1, $2, $3),";
        } else {
            attributes.forEach((attribute, index) => {
                const itemIndex = 3 * (index + 1);
                query += `($${itemIndex - 2}, $${itemIndex - 1}, $${itemIndex}),`;
            });
        }

        // Add on conflict
        query = query.slice(0, -1) + " ON CONFLICT (type, date) DO UPDATE SET total = EXCLUDED.total;";

        // Persist
        this.query(
            {
                text: query,
                values: attributes.reduce((array, attribute) => {
                    return array.concat(Object.values(attribute));
                }, [])
            },
            callback
        );
    }

    getByDates(params, callback) {
        this.query(
            {
                text: `SELECT * FROM ${this.tableName} WHERE date IN (
                    ${params.dates.map((v, i) => { return "$" + (i + 1); }).join(",")}
                )`,
                values: params.dates,
            },
            callback
        );
    }

    getByDateRange(params, callback) {
        // Group by month?
        if (params.groupBy && params.groupBy === "month") {
            this.query(
                {
                    text: `SELECT type, date_trunc('month', date) as date, SUM(total) as total FROM ${this.tableName}
                       WHERE "date" >= $1 AND "date" <= $2
                       GROUP BY date_trunc('month', date), type`,
                    values: [params.date_from, params.date_to],
                },
                callback
            );
            return;
        }

        // Group by week?
        if (params.groupBy && params.groupBy === "week") {
            this.query(
                {
                    text: `SELECT type, date_trunc('week', date) as date, SUM(total) as total FROM ${this.tableName}
                       WHERE "date" >= $1 AND "date" <= $2
                       GROUP BY date_trunc('week', date), type`,
                    values: [params.date_from, params.date_to],
                },
                callback
            );
            return;
        }

        // Group by date
        this.query(
            {
                text: `SELECT type, date, total FROM ${this.tableName} WHERE "date" >= $1 AND "date" <= $2`,
                values: [params.date_from, params.date_to],
            },
            callback
        );
    }
}

module.exports = AccessLogStatistic;
