const BaseModel = require("./base/postgres");
const CVICohortModel = require("./cvicohort");
const PBIMetricModel = require("./pbi-metric");

class PBIView extends BaseModel {
    tableName = "pbi_views";

    create(attributes, callback) {
        attributes.data = JSON.stringify(attributes.data);
        super.create(attributes, callback);
    }

    updateByPrimaryKey(id, attributes, callback) {
        attributes.data = JSON.stringify(attributes.data);
        super.updateByPrimaryKey(id, attributes, callback);
    }

    getById(id, callback) {
        this.query({
            text: `SELECT * FROM ${this.tableName} WHERE id = $1`,
            values: [id]
        }, (getError, view) => {
            // Check for error
            if (getError) {
                callback(getError, null);
                return;
            }

            // Decode data
            view = view[0];
            view.data = JSON.parse(view.data);

            (async () => {
                // Get source ids
                const sources = view.data.reduce((sourceList, item) => {
                    item.layers.forEach(layer => {
                        sourceList[layer.data_source] = (sourceList[layer.data_source] || []);
                        sourceList[layer.data_source].push(layer.id);
                    });
                    return sourceList;
                }, {});

                // Get cohorts
                if (sources.cvi_cohorts?.length > 0) {
                    sources.cvi_cohorts = await new Promise((resolve, reject) => {
                        new CVICohortModel().getById(sources.cvi_cohorts, (error, data) => {
                            // Check for error
                            if (error) { reject(error); }

                            // Re-map
                            resolve(
                                data.Items.reduce((items, item) => {
                                    items[item.cohortName + "#" + item.createdDT] = item;
                                    return items;
                                }, {})
                            );
                        });
                    });
                }

                // Get metric
                if (sources.pbi_metrics?.length > 0) {
                    sources.pbi_metrics = await new Promise((resolve, reject) => {
                        new PBIMetricModel().getById(sources.pbi_metrics, (error, data) => {
                            // Check for error
                            if (error) { reject(error); }

                            // Re-map
                            resolve(
                                data.reduce((items, item) => {
                                    items[item.metric_id] = item;
                                    return items;
                                }, {})
                            );
                        });
                    });
                }

                // Hydrate data
                view.data = view.data.map((pbiMap) => {
                    pbiMap.layers = pbiMap.layers.map((layer) => {
                        layer.metric = sources[layer.data_source][layer.id];
                        return layer;
                    });
                    return pbiMap;
                });

                return view;
            })().then((data) => {
                callback(null, data);
            }).catch((error) => {
                console.log(error);
                callback(error, null);
            });
        });
    }

    getByUser(params, callback) {
        // Initialise query
        const query = {
            text: `SELECT * FROM ${this.tableName} WHERE "user#organisation" = $1`,
            values: [params["user#organisation"]]
        };

        // Filter by team?
        if (params.teamcodes) {
            query.text += ` OR teamcode IN (${params.teamcodes.map((v, i) => "$" + (i + 2))})`;
            query.values = query.values.concat(params.teamcodes);
        }

        // Run query
        this.query(query, callback);
    }
}

module.exports = PBIView;
