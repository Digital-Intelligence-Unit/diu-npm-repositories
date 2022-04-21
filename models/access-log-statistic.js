const BaseModel = require('./base/postgres');
class AccessLogStatistic extends BaseModel {

    tableName = 'access_log_statistics';

    getByDateRange(params, callback) {
        //Group by month?
        if(params.groupBy && params.groupBy == 'month') {
            this.query({
                text: `SELECT type, date_trunc('month', date) as date, SUM(total) as total FROM ${this.tableName} 
                       WHERE "date" >= $1 AND "date" <= $2
                       GROUP BY date_trunc('month', date), type`,
                values: [params.date_from, params.date_to]
            }, callback);
            return;
        }

        //Group by week?
        if (params.groupBy && params.groupBy == 'week') {
            this.query({
                text: `SELECT type, date_trunc('week', date) as date, SUM(total) as total FROM ${this.tableName} 
                       WHERE "date" >= $1 AND "date" <= $2
                       GROUP BY date_trunc('week', date), type`,
                values: [params.date_from, params.date_to]
            }, callback);
            return;
        } 
        
        //Group by date
        this.query({
            text: `SELECT type, date, total FROM ${this.tableName} WHERE "date" >= $1 AND "date" <= $2`,
            values: [params.date_from, params.date_to]
        }, callback);
    }
}

module.exports = AccessLogStatistic;