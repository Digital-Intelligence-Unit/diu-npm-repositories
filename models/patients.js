// @ts-check
const BaseModel = require("./base/postgres");
const PermissionsHelper = require("../helpers/permissions");
const CohortModel = require("./cohort");

class PatientsModel extends BaseModel {
    selectjoin = `SELECT * FROM population_master as M`;

    getAll(limit, roles, callback) {
        const rolecheck = PermissionsHelper.capabilitiesAsSqlQuery(roles, "populationjoined", "M", true);
        if (rolecheck === "" || rolecheck === "error") {
            callback(new Error("Invalid Permissions"), null, {
                reason: "Access denied. Insufficient permissions to view any patients details.",
            });
        } else {
            console.log(rolecheck);
            const query = this.selectjoin + rolecheck + " LIMIT " + limit;
            this.query(query, (error, results) => {
                if (error) {
                    console.log("Error: " + error);
                    callback(null, "Error:" + error, null);
                } else if (results && results.length > 0) {
                    callback(null, null, results);
                } else {
                    callback(null, "No rows returned", null);
                }
            });
        }
    }

    getAllByCohort(limit, cohort, roles, callback) {
        const rolecheck = PermissionsHelper.capabilitiesAsSqlQuery(roles, "populationjoined", "M", false);
        if (rolecheck === "" || rolecheck === "error") {
            callback(new Error("Invalid Permissions"), null, {
                reason: "Access denied. Insufficient permissions to view any patients details.",
            });
        } else {
            const query = this.selectjoin + " WHERE " + CohortModel.cohortUrlAsSqlQuery(cohort) + " LIMIT " + limit;
            this.query(query, (error, results) => {
                if (error) {
                    console.log("Error: " + error);
                    callback(null, "Error:" + error, null);
                } else if (results && results.length > 0) {
                    callback(null, null, results);
                } else {
                    callback(null, "No rows returned", null);
                }
            });
        }
    }

    getPersonByNHSNumber(nhsnumber, roles, callback) {
        const rolecheck = PermissionsHelper.capabilitiesAsSqlQuery(roles, "populationjoined", "M", false);
        if (rolecheck === "" || rolecheck === "error") {
            callback(new Error("Invalid Permissions"), null, {
                reason: "Access denied. Insufficient permissions to view any patients details.",
            });
        } else {
            const query = this.selectjoin + " WHERE " + rolecheck + " nhs_number = $1";
            this.query({ text: query, values: [nhsnumber] }, (error, results) => {
                if (error) {
                    console.log("Error: " + error);
                    callback(null, error, null);
                } else if (results && results.length > 0) {
                    callback(null, null, results);
                } else {
                    this.getHistoryByNHSNumber(nhsnumber, roles, callback);
                }
            });
        }
    }

    getHistoryByNHSNumber(nhsnumber, roles, callback) {
        const rolecheck = PermissionsHelper.capabilitiesAsSqlQuery(roles, "populationjoined", "M", false);
        if (rolecheck === "" || rolecheck === "error") {
            callback(new Error("Invalid Permissions"), null, {
                reason: "Access denied. Insufficient permissions to view any patients details.",
            });
        } else {
            const query =
            this.selectjoin.replace("public.population_master", "public.population_history") +
            " WHERE " + rolecheck + "nhs_number = $1";
            this.query({ text: query, values: [nhsnumber] }, (error, results) => {
                if (error) {
                    console.log("Error: " + error);
                    callback(null, error, null);
                } else if (results && results.length > 0) {
                    callback(null, null, results);
                } else {
                    callback(null, "No rows returned", null);
                }
            });
        }
    }

    findMyNHSNumber(resource, callback) {
        let query;
        if (resource.forename) {
            query = {
                text: `
                    SELECT nhs_number FROM public.population_master 
                    WHERE "sex" = $1 AND "forename" ILIKE $2 AND "postcode" = $3 AND "date_of_birth" = $4 LIMIT 1;`,
                values: [resource.gender.substring(0, 1), resource.forename, resource.postcode, resource.dob]
            };
        } else {
            query = {
                text: `
                    SELECT nhs_number FROM public.population_master 
                    WHERE "sex" = $1 AND "postcode" = $2 AND "date_of_birth" = $3 LIMIT 1;`,
                values: [resource.gender.substring(0, 1), resource.postcode, resource.dob]
            };
        }

        // Make request
        this.query(query, (error, results) => {
            if (error) {
                console.log("Error: " + error);
                callback(error, null);
            } else if (results && results.length > 0) {
                callback(null, results);
            } else {
                this.checkHistoryTableforNHSNumber(resource, callback);
            }
        });
    }

    checkHistoryTableforNHSNumber(resource, callback) {
        let query;
        if (resource.forename) {
            query = {
                text: `
                    SELECT nhs_number FROM public.population_history 
                    WHERE "sex" = $1 AND "forename" ILIKE $2 AND "postcode" = $3 AND "date_of_birth" = $4 LIMIT 1;`,
                values: [resource.gender.substring(0, 1), resource.forename, resource.postcode, resource.dob]
            };
        } else {
            query = {
                text: `
                    SELECT nhs_number FROM public.population_history
                    WHERE "sex" = $1 AND "postcode" = $2 AND "date_of_birth" = $3 LIMIT 1;`,
                values: [resource.gender.substring(0, 1), resource.postcode, resource.dob]
            };
        }

        // Make request
        this.query(query, (error, results) => {
            if (error) {
                console.log("Error: " + error);
                callback(error, null);
            } else if (results && results.length > 0) {
                callback(null, results);
            } else {
                this.checkHistoryTableforNHSNumber(resource, callback);
            }
        });
    }
}

module.exports = PatientsModel;
