const request = require("request");
class ConfluenceModel {
  _query(endpoint, params, callback) {
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
    //Limit to user guides
    let queryOptions = {};
    queryOptions.qs = { cql: "parent=271384577" };

    //Filter by keyword?
    if (filters.keyword) {
      queryOptions.qs.cql += ` and text ~ "${filters.keyword}"`;
    }

    //Make request
    this._query("https://diu.atlassian.net/wiki/rest/api/content/search", queryOptions, (err, res, data) => {
      if (err) {
        callback(null);
      } else {
        callback(data);
      }
    });
  }

  getContentById(id, callback) {
    //Include html content
    let queryOptions = {};
    queryOptions.qs = { expand: "body.view" };

    //Make request
    this._query("https://diu.atlassian.net/wiki/rest/api/content/" + id, queryOptions, (err, res, data) => {
      if (err) {
        callback(null);
      } else {
        callback(data);
      }
    });
  }
}

module.exports = ConfluenceModel;
