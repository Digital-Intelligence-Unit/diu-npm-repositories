import db from '@adonisjs/lucid/services/db'
import { DatabaseQueryBuilderContract } from '@adonisjs/lucid/types/querybuilder';

export interface Chart {
    [key: string]: { 
        hide?: boolean; 
        filter: string|null; 
    }
}

export default class PinotBaseModel {
    
    static tableName = ''
    static charts: Chart = {}
    
    static default(query: DatabaseQueryBuilderContract<any>, column: string) {
        return query.select(column, db.raw('count(*) as v')).groupBy(column).orderBy(column).limit(5000);
    }

    static filter(filters: any, chart: string|null = null, query: any) {
        // Add custom queries here
        return query;
    }

    static get(filters: any, chart: string|null = null) {
        // Setup query
        const query = db.connection('pinot').query().from(this.tableName);

        // Add filters
        for (let key in this.charts) {
            if(filters[key] && chart !== key) {
                // Add = query
                if(this.charts[key].filter === '=') {
                    query.where(key, filters[key]);
                }
                
                // Add in query
                if(this.charts[key].filter === 'in') {
                    query.whereIn(key, filters[key].split(','));
                }

                // Add in query
                if(this.charts[key].filter === 'like') {
                    query.whereILike(key, '%' + filters[key] + '%');
                }
            }
        }

        // Add custom filters from child
        this.filter(filters, chart, query);

        if(chart) {
            // @ts-ignore
            return this[chart] ?
                // @ts-ignore
                this[chart](query, chart) : 
                this.default(query.clone(), chart);
        }

        return query;
    }

    static async getAll(filters: any): Promise<any[]> {
        // Convert to readable
        const result: any = {};
        for (let chartName of Object.keys(this.charts)) {
            // Ignore filter only charts
            if(this.charts[chartName].hide == true) {
                continue;
            }

            // @ts-ignore Get chart data
            let data = await this.get(filters, chartName);

            // Stats
            if(chartName === 'stats') {
                result[chartName] = data;
                continue;
            }

            // Reformat all others
            result[chartName] = data.reduce((obj: any, item: any) => {
                obj[item[chartName]] = {
                    v: item.v, 
                    n: item.n || null 
                }
                return obj;
            }, {});
        }
        
        return result;
    }
}
