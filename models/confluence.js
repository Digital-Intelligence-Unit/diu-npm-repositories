const request = require("request");
class ConfluenceModel {
    aQuery(endpoint, params, callback) {
        request(
            endpoint,
            Object.assign(params, {
                json: true,
                headers: { Authorization: "Basic " + process.env.CONFLUENCE_KEY },
            }),
            callback
        );
    }

    searchContent(filters = {}, callback) {
        // Limit to user guides
        const queryOptions = {};
        queryOptions.qs = { cql: "parent=271384577", expand: "metadata.labels" };

        // Filter by keyword?
        if (filters.keyword) {
            queryOptions.qs.cql += ` and text ~ "*${filters.keyword}*"`;
        }

        // Make request
        this.aQuery("https://diu.atlassian.net/wiki/rest/api/content/search", queryOptions, (err, res, data) => {
            if (err) {
                callback(null);
            } else {
                callback(data);
            }
        });
    }

    getContentById(id, callback) {
        // Include html content
        const queryOptions = {};
        queryOptions.qs = { expand: "body.view" };

        // Make request
        this.aQuery("https://diu.atlassian.net/wiki/rest/api/content/" + id, queryOptions, (err, res, data) => {
            if (err) {
                callback(null);
            } else {
                callback(data);
            }
        });
    }
}

module.exports = ConfluenceModel;
